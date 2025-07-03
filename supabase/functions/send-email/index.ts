
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'npm:@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'confirmation' | 'nomination_approved_nominator' | 'nomination_approved_boss' | 'nomination_submitted';
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

      case 'nomination_submitted':
        emailResponse = await resend.emails.send({
          from: "Best Bosses <info@bestbosses.org>",
          to: [to],
          subject: "Thank you for your nomination!",
          html: `
            <p>Hi ${data.nominatorFirstName},</p>
            <p>We've received your nomination for ${data.bossName}. Thank you for taking the time to recognize outstanding leadership through Best Bosses!</p>
            <p>Our team will now review your submission to ensure it meets our publishing standards. Once it is approved, we will notify you with the live listing and full access to our directory of amazing leaders.</p>
            <p>Truly appreciated,<br>The Best Bosses Team</p>
          `,
        });
        break;
        
      case 'nomination_approved_nominator':
        const linkedinShareText = encodeURIComponent(`🏆 Congratulations to ${data.bossName} for being recognized as a Certified #BestBoss!\n\nWho's a manager who made a big difference in your career?\n\nGive 'em a little ❤️ today!\n\n${data.bossProfileUrl}`);
        const linkedinShareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${linkedinShareText}`;
        
        emailResponse = await resend.emails.send({
          from: "Best Bosses <info@bestbosses.org>",
          to: [to],
          subject: `Your nomination of ${data.bossName} was approved!`,
          html: `
            <p>Hi ${data.nominatorFirstName},</p>
            <p>Great news: Your nomination of ${data.bossName} was approved!</p>
            <p>Which means you now have full access to the Best Bosses directory: <a href="${data.directoryUrl}">View Directory</a></p>
            <p>And to help grow the list, would you mind doing us a small but massively important favor?</p>
            <p><a href="${linkedinShareUrl}">Share the love on LinkedIn</a> - and help others pay it forward too! 🙌</p>
            <p>Truly appreciated,<br>The Best Bosses Team</p>
          `,
        });
        break;
        
      case 'nomination_approved_boss':
        const bossLinkedinShareText = encodeURIComponent(`Happy to be nominated by ${data.nominatorName} as a #BestBoss.\n\nWho's a manager who made a big difference in your career?\n\n${data.bossProfileUrl}`);
        const bossLinkedinShareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${bossLinkedinShareText}`;
        
        // Create certificate download function
        const createCertificate = () => {
          return `data:text/html;charset=utf-8,${encodeURIComponent(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Download Certificate</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .certificate { 
                  width: 800px; 
                  height: 600px; 
                  border: 8px solid #3b82f6; 
                  padding: 40px; 
                  text-align: center; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  margin: 20px auto;
                  position: relative;
                  color: white;
                }
                .title { 
                  font-size: 48px; 
                  font-weight: bold; 
                  color: white; 
                  margin-bottom: 20px; 
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .subtitle { 
                  font-size: 24px; 
                  color: rgba(255,255,255,0.9); 
                  margin-bottom: 30px; 
                }
                .name { 
                  font-size: 36px; 
                  font-weight: bold; 
                  background: linear-gradient(45deg, #f97316, #fbbf24); 
                  -webkit-background-clip: text; 
                  -webkit-text-fill-color: transparent; 
                  background-clip: text;
                  margin: 20px 0; 
                  text-shadow: none;
                }
                .description { 
                  font-size: 20px; 
                  color: rgba(255,255,255,0.95); 
                  margin: 20px 0; 
                }
                .details { 
                  font-size: 18px; 
                  color: rgba(255,255,255,0.8); 
                  margin: 20px 0; 
                }
                .footer { 
                  font-size: 16px; 
                  color: #f97316; 
                  font-weight: bold; 
                  margin-top: 40px; 
                  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                }
                .date { 
                  font-size: 14px; 
                  color: rgba(255,255,255,0.7); 
                  margin-top: 20px; 
                }
              </style>
            </head>
            <body>
              <div class="certificate">
                <div class="title">Certified Best Boss</div>
                <div class="subtitle">This is to certify that</div>
                <div class="name">${data.bossFirstName} ${data.bossLastName}</div>
                <div class="description">has been recognized as an outstanding leader by their team.</div>
                <div class="details">${data.industry} • ${data.function}</div>
                <div class="footer">Certified by BestBosses.org | Great Leaders, Verified.</div>
                <div class="date">Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <script>
                setTimeout(() => {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  canvas.width = 1200;
                  canvas.height = 800;
                  
                  // Background gradient
                  const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
                  gradient.addColorStop(0, '#667eea');
                  gradient.addColorStop(1, '#764ba2');
                  ctx.fillStyle = gradient;
                  ctx.fillRect(0, 0, 1200, 800);
                  
                  // Border
                  ctx.strokeStyle = '#3b82f6';
                  ctx.lineWidth = 8;
                  ctx.strokeRect(40, 40, 1120, 720);
                  
                  // Text
                  ctx.fillStyle = 'white';
                  ctx.font = 'bold 64px Arial';
                  ctx.textAlign = 'center';
                  ctx.shadowColor = 'rgba(0,0,0,0.3)';
                  ctx.shadowBlur = 4;
                  ctx.shadowOffsetX = 2;
                  ctx.shadowOffsetY = 2;
                  ctx.fillText('Certified Best Boss', 600, 160);
                  
                  ctx.font = '32px Arial';
                  ctx.fillStyle = 'rgba(255,255,255,0.9)';
                  ctx.fillText('This is to certify that', 600, 240);
                  
                  ctx.fillStyle = '#f97316';
                  ctx.font = 'bold 52px Arial';
                  ctx.shadowColor = 'none';
                  ctx.shadowBlur = 0;
                  ctx.fillText('${data.bossFirstName} ${data.bossLastName}', 600, 320);
                  
                  ctx.fillStyle = 'rgba(255,255,255,0.95)';
                  ctx.font = '28px Arial';
                  ctx.fillText('has been recognized as an outstanding leader by their team.', 600, 420);
                  
                  ctx.fillStyle = 'rgba(255,255,255,0.8)';
                  ctx.font = '24px Arial';
                  ctx.fillText('${data.industry} • ${data.function}', 600, 480);
                  
                  ctx.fillStyle = '#f97316';
                  ctx.font = 'bold 20px Arial';
                  ctx.shadowColor = 'rgba(0,0,0,0.3)';
                  ctx.shadowBlur = 2;
                  ctx.shadowOffsetX = 1;
                  ctx.shadowOffsetY = 1;
                  ctx.fillText('Certified by BestBosses.org | Great Leaders, Verified.', 600, 600);
                  
                  ctx.fillStyle = 'rgba(255,255,255,0.7)';
                  ctx.font = '20px Arial';
                  ctx.shadowColor = 'none';
                  ctx.shadowBlur = 0;
                  ctx.fillText('Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}', 600, 640);
                  
                  const link = document.createElement('a');
                  link.download = '${data.bossFirstName}-${data.bossLastName}-certificate.png';
                  link.href = canvas.toDataURL();
                  link.click();
                }, 1000);
              </script>
            </body>
            </html>
          `)}`;
        };
        
        emailResponse = await resend.emails.send({
          from: "Best Bosses <info@bestbosses.org>",
          to: [to],
          subject: `${data.nominatorName} Nominated You As a Best Boss!`,
          html: `
            <p>Hi ${data.bossFirstName},</p>
            <p>Congrats! You've just been named a Best Boss by ${data.nominatorName}.</p>
            <p>Here's what they had to say about you:</p>
            <blockquote style="border-left: 4px solid #007bff; padding-left: 16px; margin: 16px 0; font-style: italic;">"${data.review}"</blockquote>
            <p>At BestBosses.org (the internet's only verified manager review site), we fundamentally believe the best bosses deserve to be recognized - and to get the best talent on their teams.</p>
            <p>So be sure to share your award today:</p>
            <div style="margin: 20px 0;">
              <p><strong>1) <a href="${createCertificate()}">Download Your Certificate</a></strong></p>
              
              <p><strong>2) <a href="${bossLinkedinShareUrl}">Post on LinkedIn</a></strong></p>
              
              <p><strong>3) <a href="https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Certified%20Best%20Boss&organizationId=99177270&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certUrl=${encodeURIComponent(data.bossProfileUrl)}">Add to LinkedIn Profile</a></strong></p>
              
              <p><strong>4) <a href="mailto:?subject=Add to My Job Posting&body=Just forward this email to your recruiter:%0A%0ACan you please add the following bullet to our 'What We Offer' section:%0A%0AWork with a BestBosses.org-certified top manager. Learn more here: ${data.bossProfileUrl}">Add to a Job Posting</a></strong></p>
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
