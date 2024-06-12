import Image from "next/image";
import { Inter } from "next/font/google";
import { useState } from "react";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFormSubmit = async (e) => {
    // send api route "email"
    e.preventDefault();
    setMails([]);
    setLoading(true);
    const start = new Date().getTime();
    try {
      const emails = await fetchMails(e.target.email.value);
      setMails([...emails]);
    } catch (error) {
      console.log(error);
    } finally {
      const end = new Date().getTime();
      console.log("Time taken seconds: ", (end - start) / 1000);
      setLoading(false);
    }
  };

  const fetchMails = async (email) => {
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col items-center  min-h-screen py-2">
      <h1 className="text-4xl font-bold">Mail Sorgu</h1>
      <form
        onSubmit={onFormSubmit}
        className="flex flex-col items-center min-w-96"
      >
        <input
          className="rounded-md border border-gray-300 px-4 py-2 mt-2 w-full "
          type="email"
          name="email"
          required
        />
        <button
          className="bg-blue-500 text-white rounded-md px-4 py-2 mt-2 w-full"
          type="submit"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white m-auto" />
          ) : (
            "Sorgula"
          )}
        </button>
      </form>
      {/* mail list below */}
      {mails?.length > 0 ? (
        <div className="flex flex-col items-center w-full mt-4 border border-gray-300 rounded-md p-2">
          {mails.map((mail, i) => (
            <div key={i}>
              <div>
                <span className="font-bold">From: </span>
                {mail.header.from}
              </div>
              <div>
                <span className="font-bold">Subject: </span>
                {mail.header.subject}
              </div>
              <div>
                <span className="font-bold">Date: </span>
                {mail.header.date}
              </div>
              <div dangerouslySetInnerHTML={{ __html: mail.body }}></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 mt-3">
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 m-auto" />
          ) : (
            "Henüz mail yok."
          )}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async (context) => {
  return {
    props: {},
  };
};
