import{r,g as S,h as we,c as o,a as e,n as ke,F as C,i as I,j as c,k as P,b as be,w as ie,t as a,d as Ae,v as Se,l as _e,e as K,f as Ce,o as i}from"./index-BbMsVu6k.js";import{_ as Ie}from"./_plugin-vue_export-helper-DlAUqK2U.js";const Te=[{id:"support",name:"Customer Support Bot",description:"Handles customer support inquiries, FAQs, and basic troubleshooting",category:"Support",channels:["web-chat","phone","sms"],sampleAgent:{name:"Support Assistant",description:"Handles customer support inquiries and FAQs",instructions:"Be helpful, friendly, and concise. Always acknowledge the customer's issue before providing solutions. If you cannot help, offer to transfer to a human agent.",knowledge:[{id:1,name:"FAQ.pdf",size:"120KB",status:"processed",topics:15,content:`# Frequently Asked Questions

## Shipping & Delivery
Q: How long does shipping take?
A: Standard shipping takes 5-7 business days. Express shipping is 2-3 business days.

Q: Do you ship internationally?
A: Yes, we ship to over 50 countries worldwide.

Q: How can I track my order?
A: You'll receive a tracking number via email once your order ships.

## Returns & Refunds
Q: What is your return policy?
A: We accept returns within 30 days of purchase for a full refund.

Q: How do I start a return?
A: Contact our support team or visit your account dashboard to initiate a return.

Q: When will I receive my refund?
A: Refunds are processed within 5-7 business days after we receive your return.

## Account & Orders
Q: How do I reset my password?
A: Click "Forgot Password" on the login page and follow the instructions.

Q: Can I change my order after placing it?
A: Contact us within 1 hour of placing your order and we'll do our best to help.

Q: How do I update my shipping address?
A: You can update your address in your account settings before the order ships.

## Products
Q: Are your products eco-friendly?
A: Yes, all our products are made from sustainable materials.

Q: Do you offer warranties?
A: All products come with a 1-year manufacturer warranty.

Q: Can I see product reviews?
A: Yes, reviews are available on each product page.`}],skills:[{id:1,name:"Order Lookup",description:"Look up order status by order number",enabled:!0},{id:2,name:"Return Policy",description:"Provide return and refund information",enabled:!0}],testScenarios:[{id:1,name:"Shipping inquiry",prompt:"How long does shipping take?",expectedKeywords:["5-7 business days","standard shipping"]},{id:2,name:"Return policy",prompt:"What is your return policy?",expectedKeywords:["30 days","full refund"]},{id:3,name:"Order tracking",prompt:"How can I track my order?",expectedKeywords:["tracking number","email"]}]}},{id:"sales",name:"Sales Qualifier",description:"Qualifies leads, answers product questions, and schedules meetings",category:"Sales",channels:["web-chat","sms"],sampleAgent:{name:"Sales Assistant",description:"Qualifies leads and answers product questions",instructions:"Be professional and enthusiastic about the product. Ask qualifying questions to understand the prospect's needs. Offer to schedule a call with the sales team for qualified leads.",knowledge:[{id:1,name:"Product Info.pdf",size:"95KB",status:"processed",topics:12,content:`# Product Information

## Our Platform
We offer a comprehensive AI agent platform that helps businesses automate customer conversations across multiple channels.

## Key Features
- Voice & Phone Agents: Deploy AI agents that answer phone calls
- Multi-channel Support: Web chat, phone, SMS, and more
- Smart Handoffs: Seamless transfer to human agents with context
- Real-time Analytics: Monitor performance and improve over time
- Easy Integration: Connect with your existing tools

## Pricing
- Starter: $99/month - Up to 500 conversations
- Professional: $299/month - Up to 2,000 conversations
- Enterprise: Custom pricing - Unlimited conversations

## Use Cases
- Customer Support Automation
- Sales Lead Qualification
- Appointment Scheduling
- Order Tracking
- FAQ Handling`}],skills:[{id:1,name:"Lead Capture",description:"Collect prospect information",enabled:!0},{id:2,name:"Meeting Scheduler",description:"Schedule calls with sales team",enabled:!0}],testScenarios:[{id:1,name:"Pricing inquiry",prompt:"How much does it cost?",expectedKeywords:["$99","Starter","pricing"]},{id:2,name:"Feature question",prompt:"Do you support phone agents?",expectedKeywords:["voice","phone","calls"]}]}},{id:"appointment",name:"Appointment Scheduler",description:"Schedules appointments and manages calendar availability",category:"Operations",channels:["phone","sms","web-chat"],sampleAgent:{name:"Appointment Bot",description:"Schedules appointments and manages availability",instructions:"Be efficient and clear about available time slots. Confirm all appointment details before booking. Send confirmation messages after scheduling.",knowledge:[{id:1,name:"Business Hours.txt",size:"8KB",status:"processed",topics:5,content:`# Business Hours & Services

## Operating Hours
Monday-Friday: 9:00 AM - 6:00 PM
Saturday: 10:00 AM - 4:00 PM
Sunday: Closed

## Services Offered
- Initial Consultation (30 min)
- Standard Appointment (1 hour)
- Extended Session (2 hours)
- Virtual Meeting (30 min)

## Appointment Types
All appointments can be scheduled online or by phone.
Cancellations require 24-hour notice.`}],skills:[{id:1,name:"Calendar Integration",description:"Check availability and book appointments",enabled:!0}],testScenarios:[{id:1,name:"Check availability",prompt:"What times are available tomorrow?",expectedKeywords:["available","time slots"]}]}},{id:"order-tracking",name:"Order Tracking Bot",description:"Provides real-time order status updates",category:"Support",channels:["web-chat","sms"],sampleAgent:{name:"Order Tracker",description:"Provides real-time order status updates",instructions:"Be clear and specific about order status. Provide tracking links when available. Offer to escalate if there are issues with the order.",knowledge:[{id:1,name:"Shipping Info.txt",size:"12KB",status:"processed",topics:8,content:`# Order & Shipping Information

## Order Status Meanings
- Processing: Your order is being prepared
- Shipped: Your order is on its way
- Out for Delivery: Your order will arrive today
- Delivered: Your order has been delivered

## Tracking Your Order
You can track your order using the tracking number sent to your email.
Tracking updates every 4-6 hours.

## Delivery Issues
If your order hasn't arrived within the expected timeframe, contact support.`}],skills:[{id:1,name:"Order Lookup",description:"Look up order by order number",enabled:!0},{id:2,name:"Status Update",description:"Provide real-time status updates",enabled:!0}],testScenarios:[{id:1,name:"Order status check",prompt:"Where is my order #12345?",expectedKeywords:["order","status","tracking"]}]}},{id:"simple-faq",name:"Simple FAQ Bot",description:"Answers frequently asked questions",category:"Support",channels:["web-chat"],sampleAgent:{name:"FAQ Assistant",description:"Answers frequently asked questions",instructions:"Provide clear, concise answers to common questions. If the question is not in the knowledge base, offer to connect with a human agent.",knowledge:[{id:1,name:"General FAQ.txt",size:"15KB",status:"processed",topics:10,content:`# General FAQs

## Contact Information
Email: support@company.com
Phone: 1-800-555-0123
Hours: Monday-Friday, 9 AM - 5 PM EST

## Common Questions
Q: How do I contact support?
A: You can email us at support@company.com or call 1-800-555-0123

Q: What are your business hours?
A: We're available Monday through Friday, 9 AM to 5 PM EST

Q: Do you offer live chat?
A: Yes, this chat is monitored during business hours`}],skills:[],testScenarios:[{id:1,name:"Contact info",prompt:"How do I contact support?",expectedKeywords:["email","phone","support@company.com"]}]}}],Pe={class:"onboarding-container"},Qe={class:"progress-bar"},xe={class:"step-indicators"},Be={class:"step-number"},Me={class:"step-label"},Oe={class:"step-content"},De={key:0,class:"step-view"},Ke={class:"agent-type-grid"},qe={key:0,class:"checkmark"},We={key:0,class:"checkmark"},Ye={key:1,class:"step-view"},Fe={class:"templates-grid"},He=["onClick"],ze={class:"template-header"},Le={class:"template-name"},Ne={key:0,class:"checkmark"},Ve={class:"template-desc"},Ee={class:"template-metadata"},Ue={class:"metadata-item"},Re={class:"metadata-item"},$e={class:"metadata-item"},Ge={class:"metadata-item instructions-preview"},Je={class:"template-channels"},je=["onClick"],Xe={class:"template-header"},Ze={key:0,class:"checkmark"},es={class:"preview-modal-header"},ss={class:"preview-modal-body"},ts={class:"preview-section"},ns={class:"preview-content"},as={class:"preview-section"},os={class:"preview-knowledge-header"},is={class:"preview-knowledge-meta"},rs={class:"preview-content-snippet"},ls={key:0,class:"preview-empty"},ds={class:"preview-section"},us={class:"preview-skill-header"},cs={class:"preview-skill-status"},ps={class:"preview-skill-desc"},ms={key:0,class:"preview-empty"},vs={class:"preview-section"},gs={class:"preview-scenario-header"},hs={class:"preview-scenario-prompt"},fs={class:"preview-scenario-keywords"},ys={key:0,class:"preview-empty"},ws={class:"preview-modal-footer"},ks={class:"preview-modal-actions"},bs={key:2,class:"step-view"},As={class:"success-view"},Ss={class:"form-section center-form"},_s={class:"form-group"},Cs={class:"success-summary"},Is={class:"summary-item"},Ts={class:"summary-item"},Ps={class:"nav-buttons"},Qs=["disabled"],xs=["disabled"],Bs={__name:"OnboardingWizardView",setup(Ms){const re=Ce(),q=[{label:"Agent Type"},{label:"Template"}],d=r(0),le=S(()=>d.value>=2?100:d.value/(q.length-1)*100),p=r(null),g=Te,u=r(null),O=r(!1),T=r(null),m=S(()=>T.value?g.find(t=>t.id===T.value):null),de=S(()=>p.value?p.value==="phone"?g.filter(t=>t.channels.includes("phone")):p.value==="chat"?g.filter(t=>t.channels.includes("web-chat")):g:g);function D(t){if(u.value=t,t!=="blank"){const s=g.find(l=>l.id===t);s&&(_.value=s.sampleAgent.name)}else _.value=""}function ue(t){return{"web-chat":"Web Chat",phone:"Voice",sms:"SMS"}[t]||t}function b(t){var w,k,A;const s=((w=t.sampleAgent)==null?void 0:w.knowledge)||[],l=((k=t.sampleAgent)==null?void 0:k.skills)||[],v=((A=t.sampleAgent)==null?void 0:A.testScenarios)||[];let f="0KB",y=0;return s.length>0&&(y=s.reduce((B,M)=>B+(M.topics||0),0),f=s[0].size||"0KB"),{knowledgeCount:s.length,skillsCount:l.length,scenariosCount:v.length,totalSize:f,totalTopics:y}}function ce(t){var v;const s=((v=t.sampleAgent)==null?void 0:v.instructions)||"",l=50;return s.length<=l?s:s.substring(0,l)+"..."}function pe(t){return t?t.length<=200?t:t.substring(0,200)+"...":""}function me(t){T.value=t,O.value=!0}function Q(){O.value=!1,T.value=null}function ve(t){D(t),Q()}const _=r("");r(""),r(""),r(!1),S(()=>{var s,l;if(u.value==="blank")return 0;const t=g.find(v=>v.id===u.value);return((l=(s=t==null?void 0:t.sampleAgent)==null?void 0:s.knowledge)==null?void 0:l.length)||0}),S(()=>{var s;if(u.value==="blank")return[];const t=g.find(l=>l.id===u.value);return((s=t==null?void 0:t.sampleAgent)==null?void 0:s.knowledge)||[]});const ge=S(()=>{if(u.value==="blank")return"Blank Template";const t=g.find(s=>s.id===u.value);return(t==null?void 0:t.name)||"Custom"});r([]),r({}),r([]),r(""),r(!1);const x=r(null);r("bottom-right"),r("+1-555-0123"),r("+1-555-0125"),we(p,t=>{t==="phone"?x.value="phone":t==="chat"&&(x.value="web-chat")});const he=r("agent-"+Date.now()),W=S(()=>{switch(d.value){case 0:return p.value!==null;case 1:return u.value!==null;default:return!0}});function fe(){W.value&&d.value<2&&d.value++}function ye(){d.value>0&&d.value--}function Y(){var v,f,y,w,k;const t=u.value!=="blank"?g.find(A=>A.id===u.value):null,s={id:he.value,name:_.value,description:((v=t==null?void 0:t.sampleAgent)==null?void 0:v.description)||"",instructions:((f=t==null?void 0:t.sampleAgent)==null?void 0:f.instructions)||"",status:"draft",statusText:"Draft",channel:x.value,channels:[x.value],agentType:p.value,conversations:0,deflectionRate:0,satisfaction:"-",createdAt:new Date().toISOString(),lastUpdated:"Just now",templateId:u.value,knowledge:((y=t==null?void 0:t.sampleAgent)==null?void 0:y.knowledge)||[],skills:((w=t==null?void 0:t.sampleAgent)==null?void 0:w.skills)||[],testScenarios:((k=t==null?void 0:t.sampleAgent)==null?void 0:k.testScenarios)||[]},l=JSON.parse(localStorage.getItem("daart-agents")||"[]");l.push(s),localStorage.setItem("daart-agents",JSON.stringify(l)),localStorage.setItem("daart-onboarding-complete","true"),localStorage.setItem("daart-new-agent-id",s.id),re.push("/agents-workspace")}return(t,s)=>{var l,v,f,y,w,k,A,B,M,F,H,z,L,N,V,E,U,R,$,G,J,j,X,Z,ee,se,te,ne,ae,oe;return i(),o("div",Pe,[e("div",Qe,[e("div",{class:"progress-fill",style:ke({width:le.value+"%"})},null,4)]),e("div",xe,[(i(),o(C,null,I(q,(n,h)=>e("div",{key:h,class:P(["step-indicator",{active:d.value===h,completed:d.value>h||d.value===2&&h<2}])},[e("div",Be,a(h+1),1),e("div",Me,a(n.label),1)],2)),64))]),e("div",Oe,[d.value===0?(i(),o("div",De,[s[12]||(s[12]=e("div",{class:"welcome-header"},[e("h1",null,"Build Your Agent"),e("p",{class:"subtitle"},"Create your first AI agent in under 2 minutes")],-1)),s[13]||(s[13]=e("h2",{class:"section-title"},"What type of agent do you want to create?",-1)),s[14]||(s[14]=e("p",{class:"section-subtitle"},"Choose how your agent will communicate with customers",-1)),e("div",Ke,[e("div",{class:P(["agent-type-option",{selected:p.value==="phone"}]),onClick:s[0]||(s[0]=n=>p.value="phone")},[s[6]||(s[6]=e("div",{class:"agent-type-name"},"Voice Agent",-1)),s[7]||(s[7]=e("div",{class:"agent-type-desc"}," Your agent handles phone calls and voice conversations ",-1)),s[8]||(s[8]=e("div",{class:"agent-type-benefits"},[e("div",{class:"benefit-label"},"Best for:"),e("ul",null,[e("li",null,"Call centers"),e("li",null,"Appointment booking"),e("li",null,"Customer support lines")])],-1)),p.value==="phone"?(i(),o("div",qe,"✓")):c("",!0)],2),e("div",{class:P(["agent-type-option",{selected:p.value==="chat"}]),onClick:s[1]||(s[1]=n=>p.value="chat")},[s[9]||(s[9]=e("div",{class:"agent-type-name"},"Digital Agent",-1)),s[10]||(s[10]=e("div",{class:"agent-type-desc"}," Your agent handles text-based conversations across multiple channels ",-1)),s[11]||(s[11]=e("div",{class:"agent-type-benefits"},[e("div",{class:"benefit-label"},"Best for:"),e("ul",null,[e("li",null,"Website chat, SMS, WhatsApp"),e("li",null,"Support & sales inquiries"),e("li",null,"Quick responses")])],-1)),p.value==="chat"?(i(),o("div",We,"✓")):c("",!0)],2)])])):c("",!0),d.value===1?(i(),o("div",Ye,[s[19]||(s[19]=e("h1",null,"Choose a Template",-1)),s[20]||(s[20]=e("p",{class:"subtitle"},"Start with a pre-built agent or create from scratch",-1)),e("div",Fe,[(i(!0),o(C,null,I(de.value,n=>(i(),o("div",{key:n.id,class:P(["template-card",{selected:u.value===n.id}])},[e("div",{onClick:h=>D(n.id)},[e("div",ze,[e("div",Le,a(n.name),1),u.value===n.id?(i(),o("div",Ne,"✓")):c("",!0)]),e("div",Ve,a(n.description),1),e("div",Ee,[e("div",Ue," Knowledge: "+a(b(n).knowledgeCount)+" document"+a(b(n).knowledgeCount!==1?"s":"")+" • "+a(b(n).totalSize)+" • "+a(b(n).totalTopics)+" topics ",1),e("div",Re," Skills: "+a(b(n).skillsCount)+" configured ",1),e("div",$e," Scenarios: "+a(b(n).scenariosCount)+" test scenario"+a(b(n).scenariosCount!==1?"s":""),1),e("div",Ge,' Instructions: "'+a(ce(n))+'" ',1)]),e("div",Je,[(i(!0),o(C,null,I(n.channels,h=>(i(),o("span",{key:h,class:"channel-badge"},a(ue(h)),1))),128))])],8,He),e("a",{href:"#",class:"preview-link",onClick:ie(h=>me(n.id),["prevent","stop"])}," Preview Details ",8,je)],2))),128)),e("div",{class:P(["template-card blank",{selected:u.value==="blank"}])},[e("div",{onClick:s[2]||(s[2]=n=>D("blank"))},[e("div",Xe,[s[15]||(s[15]=e("div",{class:"template-name"},"Start from Scratch",-1)),u.value==="blank"?(i(),o("div",Ze,"✓")):c("",!0)]),s[16]||(s[16]=be('<div class="template-desc" data-v-6a412d13>Build your agent from the ground up</div><div class="template-metadata" data-v-6a412d13><div class="metadata-item" data-v-6a412d13> Knowledge: 0 documents </div><div class="metadata-item" data-v-6a412d13> Skills: 0 configured </div><div class="metadata-item" data-v-6a412d13> Scenarios: 0 test scenarios </div><div class="metadata-item instructions-preview" data-v-6a412d13> You&#39;ll configure everything yourself: instructions, knowledge base, skills, and test scenarios. </div></div>',2))])],2)]),O.value?(i(),o("div",{key:0,class:"preview-modal-overlay",onClick:Q},[e("div",{class:"preview-modal",onClick:s[4]||(s[4]=ie(()=>{},["stop"]))},[e("div",es,[e("h2",null,a((l=m.value)==null?void 0:l.name),1),e("button",{class:"close-button",onClick:Q},"×")]),e("div",ss,[e("div",ts,[s[17]||(s[17]=e("h3",null,"Instructions",-1)),e("div",ns,a((f=(v=m.value)==null?void 0:v.sampleAgent)==null?void 0:f.instructions),1)]),e("div",as,[e("h3",null,"Knowledge Base ("+a(((k=(w=(y=m.value)==null?void 0:y.sampleAgent)==null?void 0:w.knowledge)==null?void 0:k.length)||0)+" document"+a((((M=(B=(A=m.value)==null?void 0:A.sampleAgent)==null?void 0:B.knowledge)==null?void 0:M.length)||0)!==1?"s":"")+")",1),(i(!0),o(C,null,I((H=(F=m.value)==null?void 0:F.sampleAgent)==null?void 0:H.knowledge,n=>(i(),o("div",{key:n.id,class:"preview-knowledge-item"},[e("div",os,[e("strong",null,a(n.name),1),e("span",is,a(n.size)+" • "+a(n.topics)+" topics",1)]),e("div",rs,a(pe(n.content)),1)]))),128)),(N=(L=(z=m.value)==null?void 0:z.sampleAgent)==null?void 0:L.knowledge)!=null&&N.length?c("",!0):(i(),o("div",ls," No knowledge base documents included in this template. "))]),e("div",ds,[e("h3",null,"Skills ("+a(((U=(E=(V=m.value)==null?void 0:V.sampleAgent)==null?void 0:E.skills)==null?void 0:U.length)||0)+" configured)",1),(i(!0),o(C,null,I(($=(R=m.value)==null?void 0:R.sampleAgent)==null?void 0:$.skills,n=>(i(),o("div",{key:n.id,class:"preview-skill-item"},[e("div",us,[e("strong",null,a(n.name),1),e("span",cs,a(n.enabled?"Enabled":"Disabled"),1)]),e("div",ps,a(n.description),1)]))),128)),(j=(J=(G=m.value)==null?void 0:G.sampleAgent)==null?void 0:J.skills)!=null&&j.length?c("",!0):(i(),o("div",ms," No skills configured in this template. "))]),e("div",vs,[e("h3",null,"Test Scenarios ("+a(((ee=(Z=(X=m.value)==null?void 0:X.sampleAgent)==null?void 0:Z.testScenarios)==null?void 0:ee.length)||0)+")",1),(i(!0),o(C,null,I((te=(se=m.value)==null?void 0:se.sampleAgent)==null?void 0:te.testScenarios,n=>(i(),o("div",{key:n.id,class:"preview-scenario-item"},[e("div",gs,[e("strong",null,a(n.name),1)]),e("div",hs,'Prompt: "'+a(n.prompt)+'"',1),e("div",fs," Expected keywords: "+a(n.expectedKeywords.join(", ")),1)]))),128)),(oe=(ae=(ne=m.value)==null?void 0:ne.sampleAgent)==null?void 0:ae.testScenarios)!=null&&oe.length?c("",!0):(i(),o("div",ys," No test scenarios included in this template. "))])]),e("div",ws,[s[18]||(s[18]=e("p",{class:"preview-note"},"You can customize everything after selection",-1)),e("div",ks,[e("button",{class:"btn-secondary",onClick:Q},"Close"),e("button",{class:"btn-primary",onClick:s[3]||(s[3]=n=>ve(T.value))},"Use This Template")])])])])):c("",!0)])):c("",!0),d.value===2?(i(),o("div",bs,[e("div",As,[s[25]||(s[25]=e("div",{class:"success-icon"},"✓",-1)),s[26]||(s[26]=e("h1",null,"Almost Done!",-1)),s[27]||(s[27]=e("p",{class:"subtitle"},"Give your agent a name, and you're all set to customize it in the workspace",-1)),e("div",Ss,[e("div",_s,[s[21]||(s[21]=e("label",null,"Agent Name",-1)),Ae(e("input",{"onUpdate:modelValue":s[5]||(s[5]=n=>_.value=n),type:"text",placeholder:"e.g., Support Assistant, Sales Bot",class:"input-field",onKeyup:_e(Y,["enter"])},null,544),[[Se,_.value]])])]),e("div",Cs,[e("div",Is,[s[22]||(s[22]=e("strong",null,"Type:",-1)),K(" "+a(p.value==="phone"?"Voice Agent":"Digital Agent"),1)]),e("div",Ts,[s[23]||(s[23]=e("strong",null,"Template:",-1)),K(" "+a(ge.value),1)]),s[24]||(s[24]=e("div",{class:"summary-item"},[e("strong",null,"Status:"),K(" Draft ")],-1))]),s[28]||(s[28]=e("div",{class:"next-steps"},[e("h3",null,"What You'll Do Next in the Workspace"),e("ul",null,[e("li",null,"Customize agent behavior and instructions"),e("li",null,"Upload your own knowledge base (docs, FAQs, URLs)"),e("li",null,"Test with sample conversations"),e("li",null,"Deploy and go live")])],-1))])])):c("",!0)]),e("div",Ps,[d.value===1?(i(),o("button",{key:0,onClick:ye,class:"btn-secondary"}," ← Back ")):c("",!0),s[29]||(s[29]=e("div",{class:"spacer"},null,-1)),d.value<2?(i(),o("button",{key:1,onClick:fe,disabled:!W.value,class:"btn-primary"}," Continue → ",8,Qs)):c("",!0),d.value===2?(i(),o("button",{key:2,onClick:Y,disabled:!_.value.trim(),class:"btn-primary"}," Go to Workspace → ",8,xs)):c("",!0)])])}}},Ks=Ie(Bs,[["__scopeId","data-v-6a412d13"]]);export{Ks as default};
