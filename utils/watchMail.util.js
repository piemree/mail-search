import Imap from 'imap';
import quotedPrintable from 'quoted-printable';
import utf8 from 'utf8';

var imap = new Imap({
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: 'imap-mail.outlook.com',
    port: 993,
    tls: true
});

// Maksimum dinleyici sayısını artırın
imap.setMaxListeners(0);

function openInbox() {
    return new Promise((resolve, reject) => {
        imap.openBox('INBOX', true, (err, box) => {
            if (err) reject(err);
            else resolve(box);
        });
    });
}

function connectImap() {
    return new Promise((resolve, reject) => {
        imap.once('ready', resolve);
        imap.once('error', reject);
        imap.connect();
    });
}

function fetchMailBody(seqno) {
    return new Promise((resolve, reject) => {
        let mailBody = '';
        let mail = imap.seq.fetch(seqno, { bodies: 'TEXT' });

        const onMessage = function (msg) {
            const onBody = function (stream) {
                stream.on('data', function (chunk) {
                    mailBody += chunk.toString('utf8');
                });
                stream.once('end', function () {
                    try {
                        let decodedBody = quotedPrintable.decode(mailBody);
                        let utf8Body = utf8.decode(decodedBody);
                        resolve(utf8Body);
                    } catch (error) {
                        reject(error);
                    }
                });
            };

            msg.on('body', onBody);
            msg.once('end', function () {
                msg.removeListener('body', onBody);
            });
        };

        mail.on('message', onMessage);
        mail.once('error', function (err) {
            reject(err);
        });
        mail.once('end', function () {
            mail.removeListener('message', onMessage);
        });
    });
}

function fetchMails(mailTo, limit = 100) {
    return new Promise((resolve, reject) => {
        var emails = [];

        const totalMessages = imap._box.messages.total;
        const startSeq = Math.max(1, totalMessages - limit);
        const range = `${startSeq}:${totalMessages}`;

        let f = imap.seq.fetch(range, {
            bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
            struct: true
        });

        let fetchPromises = []; // Fetch promises array

        const onMessage = function (msg, seqno) {
            let buffer = '';

            const onBody = function (stream) {
                stream.on('data', function (chunk) {
                    buffer += chunk.toString('utf8');
                });
                stream.once('end', async function () {
                    let parsedHeader = Imap.parseHeader(buffer);

                    if (parsedHeader.to && parsedHeader?.to?.join()?.toLocaleLowerCase().includes(mailTo?.toLocaleLowerCase())) {
                        let fetchPromise = fetchMailBody(seqno).then(utf8Body => {
                            emails.push({
                                header: parsedHeader,
                                body: utf8Body
                            });
                        }).catch(err => {
                            console.log('Error fetching mail body: ', err);
                        });
                        fetchPromises.push(fetchPromise); // Add fetch promise to the array
                    }
                });
            };

            msg.on('body', onBody);
            msg.once('end', function () {
                msg.removeListener('body', onBody);
            });
        };

        f.on('message', onMessage);
        f.once('error', function (err) {
            console.log('Fetch error: ' + err);
            reject(err);
        });
        f.once('end', function () {
            Promise.all(fetchPromises).then(() => {
                resolve(emails);
            }).catch(err => {
                reject(err);
            });
            f.removeListener('message', onMessage);
        });
    });
}

async function watchMails(mailTo, limit) {
    try {
        await connectImap();
        await openInbox();
        const emails = await fetchMails(mailTo, limit);
        imap.end();
        return emails;
    } catch (error) {
        console.error(error);
        imap.end();
        return [];
    }
}

export default watchMails;
