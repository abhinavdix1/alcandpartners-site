export async function onRequestPost(context) {
  
  try {
    const fd = await context.request.formData();
    const n=fd.get('name')?.trim(), e=fd.get('email')?.trim(), s=fd.get('service')?.trim();
    if(!n||!e||!s) return new Response(JSON.stringify({success:false,error:'Fill all required fields.'}),{status:400,headers:{'Content-Type':'application/json'}});
    const key = context.env.MAILERSEND_API_KEY;
    if(!key) return new Response(JSON.stringify({success:false,error:'Email service not set.'}),{status:500,headers:{'Content-Type':'application/json'}});
    // Notify inbox
    await fetch('https://api.mailersend.com/v1/email',{method:'POST',headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({
      from:'ALC & PARTNERS <no-reply@alcandpartners.com>',
      to:[{email:'contact@alcandpartners.com'}],
      subject:`New request: ${s}`,
      text:`Name: ${n}\nEmail: ${e}\nService: ${s}\nDetails: ${fd.get('details')||'(none)'}`
    })});
    // Auto-reply
    await fetch('https://api.mailersend.com/v1/email',{method:'POST',headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({
      from:'ALC & PARTNERS <no-reply@alcandpartners.com>',
      to:[{email:e,name:n}],
      subject:'Thank you for contacting ALC & PARTNERS',
      text:`Hello ${n},\n\nThanks for your request about "${s}". We’ll review & send scope+fees soon.\n\n– ALC & PARTNERS`
    })});
    return new Response(JSON.stringify({success:true}),{headers:{'Content-Type':'application/json'}});
  } catch {
    return new Response(JSON.stringify({success:false,error:'Oops, try again.'}),{status:500,headers:{'Content-Type':'application/json'}});
  }
}
