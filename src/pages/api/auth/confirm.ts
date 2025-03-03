import type { NextApiRequest, NextApiResponse } from "next";
import { type EmailOtpType } from "@supabase/supabase-js";
import createClient from "@/utils/supabase/api";

function stringOrFirstString(item: string | string[] | undefined) {
  return Array.isArray(item) ? item[0] : item;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "GET") {
      res.status(405).appendHeader("Allow", "GET").end();
      return;
    }

    const queryParams = req.query;
    const token_hash = stringOrFirstString(queryParams.token_hash);
    const type = stringOrFirstString(queryParams.type);

    if (!token_hash || !type) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing required parameters",
      });
    }

    let next = "/error";

    const supabase = createClient(req, res);
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });
    if (error) {
      console.error(error);
      return res.status(400).json({
        error: "Verification Failed",
        message: error.message,
      });
    } else {
      next = stringOrFirstString(queryParams.next) || "/";

      // Validate redirect URL to prevent open redirect vulnerabilities
      const allowedHosts = [req.headers.host || ""];
      const nextUrl = new URL(next, `http://${req.headers.host}`);

      if (!allowedHosts.includes(nextUrl.host)) {
        next = "/";
      }
    }

    res.redirect(next);
  } catch (error) {
    console.error("Unexpected error in auth confirm:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}
