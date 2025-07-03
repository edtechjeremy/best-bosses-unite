import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'confirmation' | 'nomination_approved_nominator' | 'nomination_approved_boss';
  to: string;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();
    
    let emailResponse;
    
    switch (type) {
      case 'confirmation':
        emailResponse = await resend.emails.send({
          from: "Best Bosses <info@bestbosses.org>",
          to: [to],
          subject: "Please confirm your Best Bosses registration",
          html: `
            <h1>Thanks so much for registering for Best Bosses!</h1>
            <p>Please click this link to confirm your registration:</p>
            <a href="${data.confirmationLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm your email</a>
            <p>Thanks so much!</p>
            <p>-The Best Bosses Team</p>
          `,
        });
        break;
        
      case 'nomination_approved_nominator':
        const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.bossProfileUrl)}&summary=${encodeURIComponent(`🏆 Congratulations to ${data.bossName} for being recognized as a Certified #BestBoss!\n\nWho's a manager who made a big difference in your career?\n\nGive 'em a little ❤️ today!`)}`;
        
        emailResponse = await resend.emails.send({
          from: "Best Bosses <info@bestbosses.org>",
          to: [to],
          subject: `Your nomination of ${data.bossName} was approved!`,
          html: `
            <h1>Hi ${data.nominatorFirstName},</h1>
            <p>Great news: Your nomination of ${data.bossName} was approved!</p>
            <p>Which means you now have full access to the Best Bosses directory: <a href="${data.directoryUrl}">View Directory</a></p>
            <p>And to help grow the list, would you mind doing us a small but massively important favor?</p>
            <p><a href="${linkedinShareUrl}" target="_blank" style="background: #0077b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Share the love on LinkedIn</a> - and help others pay it forward too! 🙌</p>
            <p>Truly appreciated,<br>The Best Bosses Team</p>
          `,
        });
        break;
        
      case 'nomination_approved_boss':
        const bossLinkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.bossProfileUrl)}&summary=${encodeURIComponent(`Happy to be nominated by ${data.nominatorName} as a #BestBoss.\n\nWho's a manager who made a big difference in your career?`)}`;
        
        emailResponse = await resend.emails.send({
          from: "Best Bosses <info@bestbosses.org>",
          to: [to],
          subject: `${data.nominatorName} Nominated You As a Best Boss!`,
          html: `
            <h1>Hi ${data.bossFirstName},</h1>
            <p>Congrats! You've just been named a Best Boss by ${data.nominatorName}.</p>
            <p>Here's what they had to say about you:</p>
            <blockquote style="border-left: 4px solid #007bff; padding-left: 16px; margin: 16px 0; font-style: italic;">"${data.review}"</blockquote>
            <p>At BestBosses.org (the internet's only verified manager review site), we fundamentally believe the best bosses deserve to be recognized - and to get the best talent on their teams.</p>
            <p>So be sure to share your award today:</p>
            <div style="margin: 20px 0;">
              <p><strong>1) Download Your Certificate</strong><br>
              <a href="${data.certificateUrl}" target="_blank" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 8px;">Download Certificate</a></p>
              
              <p><strong>2) Post on LinkedIn</strong><br>
              <a href="${bossLinkedinShareUrl}" target="_blank" style="background: #0077b5; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 8px;">Share on LinkedIn</a></p>
              
              <p><strong>3) Add to Your LinkedIn Profile</strong><br>
              <a href="https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Certified%20Best%20Boss&organizationId=99177270&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certUrl=${encodeURIComponent(data.bossProfileUrl)}" target="_blank" style="background: #0077b5; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 8px;">Add to LinkedIn Profile</a></p>
              
              <p><strong>4) Add to a Job Posting</strong><br>
              <a href="mailto:?subject=Add to My Job Posting&body=Just forward this email to your recruiter:%0A%0ACan you please add the following bullet to our 'What We Offer' section:%0A%0AWork with a BestBoss.org-certified top manager. Learn more here: ${data.bossProfileUrl}" style="background: #6c757d; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 8px;">Email for Job Posting</a></p>
            </div>
            <p>Congrats again! 🎉<br>-The Best Bosses Team</p>
          `,
        });
        break;
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);