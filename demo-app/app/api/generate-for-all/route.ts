import { NextResponse } from "next/server"
import crypto from "crypto"
import { encrypt } from "@/lib/encryption"
import { sendEmail } from "@/lib/email"
import { Redis } from '@upstash/redis';

// Initialize Redis with better error handling
let redis: Redis;

try {
  // Initialize Redis from env vars
  redis = Redis.fromEnv();
  console.log("Redis initialized successfully for generate-for-all API");
} catch (error) {
  console.error("Failed to initialize Redis:", error);
  // Create a dummy redis instance to prevent crashes
  redis = {
    get: async (key: string) => { 
      console.log(`[Mock Redis] GET ${key}`);
      return null;
    },
    set: async (key: string, value: string) => {
      console.log(`[Mock Redis] SET ${key} = ${value}`);
      return "OK";
    }
  } as any;
  console.warn("Using mock Redis instance due to initialization failure");
}

export async function POST(request: Request) {
  try {
    // Check that we have the necessary environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials missing! EMAIL_USER or EMAIL_PASS not set.");
      return NextResponse.json({ 
        message: "Server configuration error. Email credentials not configured.",
        error: "Missing email credentials"
      }, { status: 500 });
    }

    console.log("Starting generate-for-all process...");
    
    // Get the mailing list from environment variables
    const mailingList = process.env.MAILING_LIST
      ? process.env.MAILING_LIST.split(",").map(email => email.trim())
      : [ "amro.imam@outlook.com",
        "thaisdelimasilva@gmail.com",
        "alldavidcony@gmail.com",
        "argyros@csd.uoc.gr",
        "davide.fanciulli@un.org",
        "hei@zurich.ibm.com",
        "kelmaghr@us.ibm.com",
        "hsati@nyu.edu",
        "vardaan.sahgal@womanium.org",
        "terri.burns@nyu.edu",
        "reem@womeninai.co",
        "worawat@g.sut.ac.th",
        "pakshenchoong@gmail.com",
        "krisztian.benyo@enpc.fr",
        "edoardo.pedicillo@gmail.com",
        "joanna.e.majsak@gmail.com",
        "kramadi@nyu.edu",
        "muhammad.shafique@nyu.edu",
        "baghdadi@nyu.edu",
        "Youssef.Eldakar@bibalex.org",
        "gff@co.it.pt",
        "juliatt@amazon.de",
        "lgatti@correo.um.edu.uy",
        "mkhurana1_be22@thapar.edu",
        "amaria.javed@nyu.edu",
        "201137@ppu.edu.ps",
        "begali.aslonov@studenti.polito.it",
        "lzahhafi@aims.ac.rw",
        "achditya@gmail.com",
        "Omid.Hassasfar@gmail.com",
        "wenhe.zhang@yale.edu",
        "momahmoud591@gmail.com",
        "mennamagdyx@gmail.com",
        "ssingh27_be22@thapar.edu",
        "sh7072@nyu.edu",
        "m.batale@alustudent.com",
        "yz9687@nyu.edu",
        "natansh.mathur@qcware.com",
        "217034@ppu.edu.ps",
        "hope.alemayehu-ug@aau.edu.et",
        "mohamed.hamaidi@ensia.edu.dz",
        "nnm30@mail.aub.edu",
        "david.morcuende.c@gmail.com",
        "ehll@g.clemson.edu",
        "patriciankenlif@gmail.com",
        "nunomarquesbatista@gmail.com",
        "b00091104@aus.edu",
        "ab10028@nyu.edu",
        "hj2342@nyu.edu",
        "malmetnawy@gmail.com",
        "jy_farhani@esi.dz",
        "premsing212@jbnu.ac.kr",
        "zaynassaf2001@gmail.com",
        "tusharp@tamu.edu",
        "valentm@clemson.edu",
        "b00098231@aus.edu",
        "okekemakuo67@gmail.com",
        "douaa.salah@epfl.ch",
        "fenlei.chen@yale.edu",
        "100060746@ku.ac.ae",
        "smaffan21@gmail.com",
        "chantelle@aims.edu.gh",
        "af4329@nyu.edu",
        "ben.hall@infleqtion.com",
        "belal.asad@students.alquds.edu",
        "nouhaila.innan@nyu.edu",
        "GehadSalemFekry@aucegypt.edu",
        "shhun75@gmail.com",
        "mxf4642@nyu.edu",
        "ekimfrankey@gmail.com",
        "kiryowa@aims.edu.gh",
        "dyn0215296@ju.edu.jo",
        "U22100221@sharjah.ac.ae",
        "b00089025@aus.edu",
        "221116@ppu.edu.ps",
        "ZIYATIHAFSSA14@GMAIL.COM",
        "g00091123@aus.edu",
        "belekarg@tcd.ie",
        "kristina.d.kirova@gmail.com",
        "oturki036@gmail.com",
        "jamesamyer@gmail.com",
        "mousa_math@ppu.edu",
        "an3502@nyu.edu",
        "malicksalman2@gmail.com",
        "U22100183@sharjah.ac.ae",
        "rimst3@gmail.com",
        "tt2273@nyu.edu",
        "kk4827@nyu.edu",
        "ay2395@nyu.edu",
        "saraalagami@gmail.com",
        "pawel.gora@qaif.org",
        "sakibul56@gmail.com",
        "adh323@lehigh.edu",
        "espinosa.s@northeastern.edu",
        "adk05@mail.aub.edu",
        "jam37@mail.aub.edu",
        "deahmedbacha@gmail.com",
        "km_bekkar@esi.dz",
        "safaebouziani27@gmail.com",
        "mis9424@nyu.edu",
        "aaa9988@nyu.edu",
        "ni2071@nyu.edu",
        "nils.quetschlich@tum.de",
        "epadouros@gmail.com",
        "epelaez@uchicago.edu",
        "100067138@ku.ac.ae",
        "yonara.anastacio@columbia.edu",
        "y.kouttane@aui.ma",
        "m_abualrub03@outlook.com",
        "202110225@students.asu.edu.jo",
        "omarsufyan2016@gmail.com",
        "km_benbetka@esi.dz",
        "akanbari@student.42abudhabi.ae",
        "mki4895@nyu.edu",
        "maryam.alsabaaa@gmail.com",
        "jibranrashid@gmail.com",
        "sjayaraj@nyit.edu",
        "cffuidio@gmail.com",
        "squan710@gmail.com",
        "zakaria.boutakka-etu@etu.univh2c.ma",
        "ka_seddiki@esi.dz",
        "lk_brouthen@esi.dz",
        "g00095118@aus.edu",
        "tcivini@gmail.com",
        "hajarasabnam@gmail.com",
        "Tamara.hamad01@gmail.com",
        "andrei.bornea@insead.edu",
        "alisaffarini@college.harvard.edu",
        "luca.sipoteanu@nyu.edu",
        "as15471@nyu.edu",
        "as.aminesouiri@gmail.com",
        "bhernandez2318@gmail.com",
        "joaquin.molina.u@uc.cl",
        "oliver.knitter@sandboxquantum.com",
        "staha@tcd.ie",
        "nguyenhoanganh20033@gmail.com",
        "yassine.berrada2020@gmail.com",
        "am12805@nyu.edu",
        "myn11@mail.aub.edu",
        "farhan.kamrul@nyu.edu",
        "km_arab@esi.dz",
        "pawuah@aims.edu.gh",
        "aniruddhasen@utexas.edu",
        "najones@clemson.edu",
        "alberto.marchisio@nyu.eu",
        "kooshan.mk@gmail.com",
        "Is2431@nyu.edu",
        "priya.aswani28139@gmail.com",
        "noah.ripke@yale.edu",
        "tfg7297@nyu.edu",
        "ireneamedji@gmail.com",
        "dv2335@nyu.edu",
        "mostafatorkashvand98@yahoo.com",
        "hala.renann@gmail.com",
        "kambleyash679@gmail.com",
        "nadaelhaj@hotmail.com",
        "mohammed.alghadeer@physics.ox.ac.uk",
        "erenaykrcn@hotmail.com",
        "anguetsa@aimsric.org",
        "muhammadkashif038@gmail.com",
        "U22106802@sharjah.ac.ae",
        "omarkashour45@gmail.com",
        "rt2970@columbia.edu",
        "h.awladmohammed@student.aaup.edu",
        "a23ibrah@uwaterloo.ca",
        "db4364@nyu.edu",
        "mahdia.toubal@gmail.com",
        "k.jallad.l@gmail.com",
        "naa506@nyu.edu",
        "sc9425@nyu.edu",
        "samakanbour@gmail.com",
        "azizaalm@mit.edu",
        "sjv2896@nyu.edu",
        "Awadhoot-Vijay_Loharkar@etu.u-bourgogne.fr",
        "asawaika@yahoo.com",
        "arnisjl7@gmail.com",
        "23u236@psgtech.ac.in",
        "aqsask2004@gmail.com",
        "lwa2019@nyu.edu",
        "oduaiabrb@gmail.com",
        "mka7870@nyu.edu",
        "100061269@ku.ac.ae",
        "khaled.w.alshaer@gmail.com",
        "parampathak28@gmail.com",
        "elmaouaki.walid@gmail.com",
        "rumlah.amer@gmail.com",
        "zakaria.dahbi@kcl.ac.uk",
        "konstantinosdalampekis@gmail.com",
        "ys3571@columbia.edu",
        "shoogshun.19@gmail.com",
        "qassamwirdian3@gmail.com",
        "rmb9836@nyu.edu",
        "ak11796@nyu.edu",
        "100063481@ku.ac.ae",
        "ajs787@scarletmail.rutgers.edu",
        "mk8737@nyu.edu",
        "mnaghdi@caltech.edu",
        "thakur.akashkant@gmail.com",
        "amahdy7@gmail.com",
        "up202200549@edu.fe.up.pt",
        "mariamimahomed@gmail.com",
        "g12_gonzalez@ens.cnyn.unam.mx",
        "la_akeb@esi.dz",
        "jf_rezkellah@esi.dz",
        "dev.aswani1505@gmail.com",
        "javi@karibalabs.co",
        "othman.omm@najah.edu",
        "g00091827@aus.edu",
        "visistajayanti@gmail.com",
        "yaffajaradat@gmail.com",
        "claudiogomes@cmu.edu",
        "muhammadalzafark@gmail.com",
        "aulan@aims.ac.za",
        "oisamade999@gmail.com",
        "d.waweru@alustudent.com",
        "tasnim.ahmed@nyu.edu",
        "pablobastante550@gmail.com",
        "talah.2204@gmail.com",
        "nathan.abebe@yale.edu",
        "mom8702@nyu.edu",
        "s12255133@stu.najah.edu",
        "jccga@iscte-iul.pt",
        "ma7030@nyu.edu",
        "aws.alhantouli@gmail.com",
        "colin.campbell@infleqtion.com",
        "forsomethingnewsid@gmail.com",
        "nada.ik81@gmail.com",
        "soguntunnbi@gmail.com",
        "martin.moureau@epfl.ch",
        "william.zhong@yale.edu",
        "hounsavijuleskoffi@gmail.com",
        "s12116231@stu.najah.com",
        "miqdadyayah0@gmail.com",
        "arg9555@nyu.edu",
        "rebecca.rajeshb@gmail.com",
        "ns5376@nyu.edu",
        "evameguem@gmail.com",
        "14akash2000@gmail.com",
        "ruddin@iba.edu.pk",
        "souhaibbenbouazza@gmail.com",
        "kaa74@mail.aub.edu",
        "yash.chauhan@niser.ac.in",
        "nesrine.abdelhak@ensia.edu.dz",
        "shamzaou@student.42abudhabi.ae",
        "mariomamdouh@aucegypt.edu",
        "eh3115@nyu.edu",
        "msu227@nyu.edu",
        "sadeil.yassen@students.alquds.edu",
        "rm6173@nyu.edu",
        "kh_benouaklil@esi.dz",
        "ytheod@mail.ntua.gr"] // Default list
    
    console.log(`Mailing list loaded with ${mailingList.length} recipients`);

    // Get the frontend URL from environment variables or use default
    const frontendBaseURL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://sawty-voting.vercel.app"
    console.log(`Using frontend base URL: ${frontendBaseURL}`);

    const results = []

    // Process each email in the mailing list
    for (const email of mailingList) {
      console.log(`Processing email: ${email}`);
      
      try {
        // Check if there's already a digital signature stored in Redis
        let digitalSignature: string | null = null;
        try {
          digitalSignature = await redis.get<string>(`email:${email}`);
          console.log(`Existing signature for ${email}: ${digitalSignature ? "Found" : "Not found"}`);
        } catch (redisError) {
          console.error(`Redis error when getting signature for ${email}:`, redisError);
        }

        if (!digitalSignature) {
          // If not found, generate a new one
          digitalSignature = crypto.randomBytes(4).toString("hex")
          console.log(`Generated new digital signature for ${email}: ${digitalSignature}`);

          // Save the digitalSignature -> email mapping
          try {
            await redis.set(`email:${email}`, digitalSignature)
            await redis.set(`secret:${digitalSignature}`, email)
            console.log(`Saved mappings for ${email} <-> ${digitalSignature}`);
          } catch (redisSaveError) {
            console.error(`Redis error when saving signature for ${email}:`, redisSaveError);
            // Continue anyway, we'll still try to send the email
          }
        }

        // Encrypt the digital signature for URL
        const encryptedSignature = encrypt(digitalSignature)
        const loginLink = `${frontendBaseURL}/index?token=${encodeURIComponent(encryptedSignature)}`
        console.log(`Generated login link for ${email}`);

        // Send email
        try {
          await sendEmail({
            to: email,
            subject: "Your Sawty Voting Link",
            text: `Hello,

You have been assigned a secure voting link by Sawty.

Please click the link below to log in and cast your secure vote:

👉 ${loginLink}

This link is encrypted for your privacy.
Please do not share it with anyone.

Thank you,
Sawty Voting Team`,
          })

          console.log(`✅ Secure Voting Link sent to ${email}`);
          results.push({ email, digitalSignature, status: "success" });
        } catch (emailError) {
          console.error(`❌ Failed to send to ${email}:`, emailError);
          results.push({ 
            email, 
            status: "failed", 
            error: emailError instanceof Error 
              ? emailError.message 
              : String(emailError) 
          });
        }
      } catch (processingError) {
        console.error(`Error processing ${email}:`, processingError);
        results.push({ 
          email, 
          status: "failed", 
          error: "Internal processing error" 
        });
      }
    }

    // Log statistics
    const successCount = results.filter(r => r.status === "success").length;
    const failCount = results.filter(r => r.status === "failed").length;
    console.log(`Generate-for-all completed. Success: ${successCount}, Failed: ${failCount}`);

    return NextResponse.json({
      message: "Done sending secure links to mailing list",
      stats: {
        total: results.length,
        success: successCount,
        failed: failCount
      },
      results,
    })
  } catch (error) {
    console.error("Error in generate-for-all endpoint:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
      
    return NextResponse.json({ 
      message: "Server error. Please try again later.",
      error: errorMessage 
    }, { status: 500 })
  }
}
