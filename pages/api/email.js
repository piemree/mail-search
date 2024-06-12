import watchMails from "@/utils/watchMail.util";


export default async function handler(req, res) {
  try {
    const email = req.body?.email?.trim();
    if (!email) return res.status(400).json({ error: "Email is required" });
    const limit = process.env.LIMIT || 100;
    const emails = await watchMails(email, limit);
    res.status(200).json(emails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }


}
