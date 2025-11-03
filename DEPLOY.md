# Deploy DAART Prototype

The build is ready in the `dist/` folder. Here are 3 easy ways to deploy:

---

## Option 1: Netlify (Recommended - 2 minutes)

1. Go to https://app.netlify.com/drop
2. Drag and drop the `dist` folder
3. Get instant URL (e.g., `random-name-123.netlify.app`)
4. Share with Aykut!

**Pros:** Easiest, no CLI needed, instant

---

## Option 2: Vercel (Best for Vite projects)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd ~/code/daart-onboarding-prototype
vercel --prod

# Follow prompts (login with GitHub)
# Get URL: something.vercel.app
```

**Pros:** Great performance, custom domains

---

## Option 3: Surge (Simplest CLI)

```bash
# Already installed, just login and deploy
cd ~/code/daart-onboarding-prototype/dist
surge . daart-onboarding.surge.sh

# Enter email/password when prompted
# Get URL: daart-onboarding.surge.sh
```

**Pros:** Simple, memorable URL

---

## Option 4: GitHub Pages (If you want Git history)

```bash
cd ~/code/daart-onboarding-prototype

# Initialize git
git init
git add .
git commit -m "Initial DAART prototype"

# Create GitHub repo (via gh CLI or web)
gh repo create daart-onboarding-prototype --public --source=.
git push -u origin main

# Deploy to GitHub Pages
npm install -g gh-pages
gh-pages -d dist

# URL: https://yourusername.github.io/daart-onboarding-prototype
```

**Pros:** Version control + deployment

---

## My Recommendation:

**Use Netlify Drop (Option 1)** - literally 2 minutes:

1. Open https://app.netlify.com/drop in browser
2. Drag `~/code/daart-onboarding-prototype/dist` folder
3. Copy URL
4. Send to Aykut!

That's it! No CLI, no authentication, instant deployment.

---

## After Deployment:

Send Aykut:
- 🔗 Live URL
- 📄 README.md (explains the prototype)
- 📊 RECOMMENDATIONS.md (your insights)

---

## Custom Domain (Optional)

If you want a better URL like `daart.dialpad.com`:
- Use Netlify or Vercel
- Add custom domain in settings
- Update DNS records
