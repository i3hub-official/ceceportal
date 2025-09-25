import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Shield,
  Cpu,
  Users,
  Target,
  Heart,
  Award,
  GraduationCap,
  Church
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-3 rounded-xl">
              <Church className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">About CEC Okigwe</h1>
          </div>
          <p className="text-xl max-w-3xl text-white/90">
            Catholic Education Commission, Okigwe Diocese, Imo State, Nigeria. 
            Providing quality education and faith formation to students across the diocese.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Mission & Values</h2>
            <p className="text-foreground/70 max-w-3xl mx-auto">
              We are committed to holistic education that nurtures the mind, body, and spirit 
              in accordance with Catholic teachings and values.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Academic Excellence</h3>
              <p className="text-foreground/70">
                We provide quality education that meets national standards while 
                incorporating Catholic values and teachings.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Faith Formation</h3>
              <p className="text-foreground/70">
                We nurture spiritual growth and moral development based on 
                Catholic doctrines and traditions.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Building</h3>
              <p className="text-foreground/70">
                We foster a supportive community where students, teachers, and 
                parents work together for success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-muted px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="md:flex items-center gap-12">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl font-bold mb-6">Our History</h2>
              <p className="text-foreground/70 mb-4">
                The Catholic Education Commission, Okigwe Diocese was established to 
                coordinate and oversee Catholic education within the diocese. Since our 
                founding, we have been committed to providing quality education that 
                integrates faith and learning.
              </p>
              <p className="text-foreground/70">
                Our network of schools serves thousands of students across Imo State, 
                offering them not just academic knowledge but also moral guidance and 
                spiritual formation in line with Catholic teachings.
              </p>
            </div>
            <div className="md:w-1/2 bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">20+ Schools</h3>
                  <p className="text-sm text-foreground/70">In our network</p>
                </div>
                <div className="text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">10,000+ Students</h3>
                  <p className="text-sm text-foreground/70">Served annually</p>
                </div>
                <div className="text-center">
                  <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">500+ Teachers</h3>
                  <p className="text-sm text-foreground/70">Dedicated staff</p>
                </div>
                <div className="text-center">
                  <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">15+ Years</h3>
                  <p className="text-sm text-foreground/70">Of service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-card pt-16 pb-6 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          {/* Top section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand + Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold select-none tracking-tight">
                  <span className="text-primary">CEC Okigwe</span>
                </h3>
              </div>
              <p className="text-foreground/70 mb-6 text-sm leading-relaxed">
                Catholic Education Commission, Okigwe Diocese, Imo State, Nigeria.
                Providing quality education and faith formation to students across
                the diocese through our network of Catholic schools.
              </p>

              {/* Technology branding */}
              <div className="flex flex-col gap-2 mb-4 text-xs text-foreground/60">
                <div className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  <span>Powered by</span>
                  <span className="font-semibold text-primary">i3Hub</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Secured by</span>
                  <span className="font-semibold text-secondary">I3SecureID</span>
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-foreground/70 hover:text-primary transition"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-primary transition"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-primary transition"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-primary transition"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#registration"
                    className="hover:text-primary transition"
                  >
                    Registration
                  </a>
                </li>
                <li>
                  <a href="#subjects" className="hover:text-primary transition">
                    Subjects
                  </a>
                </li>
                <li>
                  <a
                    href="#instructions"
                    className="hover:text-primary transition"
                  >
                    How to Register
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-primary transition">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" /> +234 803 456 7890
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" /> cec.okigwe@catholic.org.ng
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" /> Okigwe Diocese, Imo
                  State, Nigeria
                </li>
              </ul>
            </div>
          </div>
       
        </div>
      </footer>
    </div>
  );
}