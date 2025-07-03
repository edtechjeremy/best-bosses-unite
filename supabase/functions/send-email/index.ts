
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
        
        // Create a direct certificate download function that works without authentication
        const createCertificateFunction = () => {
          return `
            function downloadCertificate() {
              const canvas = document.createElement('canvas');
              canvas.width = 1400;
              canvas.height = 1000;
              const ctx = canvas.getContext('2d');
              
              // Premium gradient background (professional blue to purple)
              const gradient = ctx.createLinearGradient(0, 0, 1400, 1000);
              gradient.addColorStop(0, '#3b82f6');
              gradient.addColorStop(0.5, '#6366f1');
              gradient.addColorStop(1, '#8b5cf6');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 1400, 1000);
              
              // Luxury border with multiple layers
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 12;
              ctx.strokeRect(60, 60, 1280, 880);
              
              ctx.strokeStyle = '#f97316';
              ctx.lineWidth = 6;
              ctx.strokeRect(80, 80, 1240, 840);
              
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.strokeRect(100, 100, 1200, 800);
              
              // Premium title with shadow
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 80px Georgia, serif';
              ctx.textAlign = 'center';
              ctx.shadowColor = 'rgba(0,0,0,0.3)';
              ctx.shadowBlur = 8;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 4;
              ctx.fillText('CERTIFIED', 700, 240);
              
              // "Best Boss" with luxury styling
              ctx.font = 'bold 90px Georgia, serif';
              const bestBossGradient = ctx.createLinearGradient(0, 280, 0, 360);
              bestBossGradient.addColorStop(0, '#f97316');
              bestBossGradient.addColorStop(1, '#fb923c');
              ctx.fillStyle = bestBossGradient;
              ctx.fillText('BEST BOSS', 700, 340);
              
              // Elegant subtitle
              ctx.font = '36px Georgia, serif';
              ctx.fillStyle = 'rgba(255,255,255,0.9)';
              ctx.shadowBlur = 4;
              ctx.fillText('This certificate is proudly presented to', 700, 420);
              
              // Boss name with premium styling
              ctx.font = 'bold 72px Georgia, serif';
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = 'rgba(247, 147, 22, 0.5)';
              ctx.shadowBlur = 12;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              ctx.fillText('${data.bossFirstName} ${data.bossLastName}', 700, 540);
              
              // Recognition text
              ctx.font = '32px Georgia, serif';
              ctx.fillStyle = 'rgba(255,255,255,0.95)';
              ctx.shadowColor = 'rgba(0,0,0,0.2)';
              ctx.shadowBlur = 4;
              ctx.fillText('in recognition of outstanding leadership', 700, 620);
              ctx.fillText('and exceptional management excellence', 700, 670);
              
              // Premium footer with warm orange accent
              ctx.fillStyle = '#f97316';
              ctx.font = 'bold 24px Georgia, serif';
              ctx.shadowColor = 'rgba(0,0,0,0.3)';
              ctx.shadowBlur = 4;
              ctx.fillText('BESTBOSSES.ORG', 700, 780);
              
              ctx.font = '20px Georgia, serif';
              ctx.fillStyle = 'rgba(255,255,255,0.8)';
              ctx.fillText('Great Leaders, Verified.', 700, 810);
              
              // Elegant date
              ctx.font = '18px Georgia, serif';
              ctx.fillStyle = 'rgba(255,255,255,0.7)';
              const today = new Date();
              ctx.fillText('Certified: ' + today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 700, 860);
              
              // Download
              const link = document.createElement('a');
              link.download = '${data.bossFirstName}-${data.bossLastName}-best-boss-certificate.png';
              link.href = canvas.toDataURL('image/png', 1.0);
              link.click();
            }
            
            // Auto-download when page loads
            window.addEventListener('load', downloadCertificate);
          `;
        };
        
        const certificateDownloadUrl = `data:text/html;charset=utf-8,${encodeURIComponent(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Download Your Best Boss Certificate</title>
            <style>
              body { 
                font-family: Georgia, serif; 
                text-align: center; 
                padding: 40px; 
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              }
              .container {
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255,255,255,0.2);
              }
              h1 { 
                font-size: 48px; 
                margin-bottom: 20px; 
                color: #f97316;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              }
              p { 
                font-size: 20px; 
                margin-bottom: 30px; 
                line-height: 1.6;
              }
              .download-btn {
                background: #f97316;
                color: white;
                padding: 15px 30px;
                font-size: 18px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-family: Georgia, serif;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(247, 147, 22, 0.3);
                transition: all 0.3s ease;
                margin: 10px;
              }
              .download-btn:hover {
                background: #ea580c;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(247, 147, 22, 0.4);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🏆 Congratulations!</h1>
              <p>Your premium Best Boss certificate is downloading automatically.</p>
              <p>If the download doesn't start, click below:</p>
              <button class="download-btn" onclick="downloadCertificate()">Download Certificate</button>
            </div>
            <script>${createCertificateFunction()}</script>
          </body>
          </html>
        `)}`;
        
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
              <p><strong>1) <a href="${certificateDownloadUrl}">Download Your Certificate</a></strong></p>
              
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
