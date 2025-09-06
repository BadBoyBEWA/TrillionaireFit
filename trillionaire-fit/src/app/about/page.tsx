import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          About Me
        </h1>
        <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
          Welcome to Trillionaire Fit - where luxury fashion meets curated excellence
        </p>
      </section>

      {/* Profile Section */}
      <section className="grid gap-12 md:grid-cols-2 items-start">
        {/* Profile Image */}
        <div className="space-y-6">
          <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-zinc-100 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-zinc-200 rounded-full mx-auto flex items-center justify-center">
                <span className="text-6xl">👤</span>
              </div>
              <p className="text-zinc-600 font-medium">Founder & Curator</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-zinc-900">5+</div>
              <div className="text-sm text-zinc-600">Years Experience</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-zinc-900">100+</div>
              <div className="text-sm text-zinc-600">Designers</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-zinc-900">50+</div>
              <div className="text-sm text-zinc-600">Countries</div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Founder & Curator</h2>
            <p className="text-zinc-600 leading-relaxed">
              I'm passionate about bringing the world's most exclusive fashion pieces 
              directly to your wardrobe. With years of experience in luxury retail and 
              a keen eye for emerging trends, I curate collections that define style 
              and sophistication.
            </p>
            <p className="text-zinc-600 leading-relaxed">
              Trillionaire Fit isn't just about clothing—it's about creating a lifestyle 
              that reflects your unique personality and aspirations. Every piece in our 
              collection is carefully selected for its quality, craftsmanship, and 
              timeless appeal.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-zinc-50 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-semibold">My Mission</h3>
            <p className="text-zinc-700 italic">
              "To democratize luxury fashion by making the world's most coveted 
              pieces accessible while maintaining the exclusivity and quality that 
              defines true luxury."
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Get In Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
                <span className="text-zinc-600">hello@trillionairefit.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
                <span className="text-zinc-600">Follow @trillionairefit</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
                <span className="text-zinc-600">Based in New York, NY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-center">What Drives Me</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-semibold">Quality First</h3>
            <p className="text-zinc-600 text-sm">
              Every piece is handpicked for exceptional quality and craftsmanship
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="font-semibold">Global Reach</h3>
            <p className="text-zinc-600 text-sm">
              Connecting you with designers and boutiques from around the world
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">💎</span>
            </div>
            <h3 className="font-semibold">Exclusive Access</h3>
            <p className="text-zinc-600 text-sm">
              Curated collections featuring limited editions and emerging designers
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
