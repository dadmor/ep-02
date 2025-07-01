// src/pages/landing/LandingPage.tsx - ZAKTUALIZOWANY PLIK
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router';
import { 
  Trophy, 
  Target, 
  Users, 
  Gamepad2, 
  BarChart3, 
  Smartphone,
  Star,
  Flame,
  Award,
  PlayCircle,
  Menu,
  X,
  BookOpen,
  Zap,
  Shield
} from 'lucide-react';

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Gamepad2 className="w-8 h-8 text-white" />,
      title: "System Gamifikacji",
      description: "Zdobywaj XP, poziomy, odznaki i rywalizuj z innymi uczniami. System streak motywuje do codziennej nauki.",
      gradient: "from-blue-800 to-blue-900", // Główny niebieski z logo
      bgGradient: "from-blue-800/10 to-blue-900/10"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Analiza Postępów",
      description: "Szczegółowe raporty pokazują Twoje mocne i słabe strony. AI analizuje błędy i proponuje spersonalizowane ćwiczenia.",
      gradient: "from-orange-500 to-orange-600", // Pomarańczowy z logo
      bgGradient: "from-orange-500/10 to-orange-600/10"
    },
    {
      icon: <Trophy className="w-8 h-8 text-white" />,
      title: "Rankingi i Konkursy",
      description: "Sprawdź się w rywalizacji z innymi uczniami. Cotygodniowe konkursy z atrakcyjnymi nagrodami.",
      gradient: "from-yellow-500 to-orange-500", // Żółto-pomarańczowy z logo
      bgGradient: "from-yellow-500/10 to-orange-500/10"
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Spersonalizowane Lekcje",
      description: "AI dostosowuje poziom trudności do Twoich umiejętności. Każdy uczeń ma unikalną ścieżkę rozwoju.",
      gradient: "from-purple-600 to-purple-700", // Fioletowy z logo
      bgGradient: "from-purple-600/10 to-purple-700/10"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Grupy i Klasy",
      description: "Nauczyciele mogą łatwo zarządzać klasami, przydzielać zadania i monitorować postępy uczniów.",
      gradient: "from-teal-500 to-cyan-600", // Turkusowy z logo
      bgGradient: "from-teal-500/10 to-cyan-600/10"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-white" />,
      title: "Dostęp z każdego urządzenia",
      description: "Ucz się w domu, w szkole czy w podróży. Synchronizacja między urządzeniami zapewnia ciągłość nauki.",
      gradient: "from-red-500 to-red-600", // Czerwony z logo
      bgGradient: "from-red-500/10 to-red-600/10"
    }
  ];

  const stats = [
    { number: "15K+", label: "Aktywnych uczniów" },
    { number: "98%", label: "Zadowolenia" },
    { number: "2M+", label: "Zdobytych XP" }
  ];

  const benefits = [
    {
      icon: <BookOpen className="w-6 h-6 text-blue-800" />,
      title: "Skuteczna nauka",
      description: "95% uczniów poprawia swoje wyniki w ciągu pierwszych 30 dni"
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-600" />,
      title: "Szybkie efekty",
      description: "Widoczne rezultaty już po pierwszym tygodniu regularnej nauki"
    },
    {
      icon: <Shield className="w-6 h-6 text-teal-600" />,
      title: "Bezpieczna platforma",
      description: "Zgodność z RODO i najwyższe standardy bezpieczeństwa danych"
    }
  ];

  const handleGetStarted = () => {
    navigate('/register/step1');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b' 
          : 'bg-white/90 backdrop-blur-sm border-b border-gray-200/50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src={'/smart-edu-play-logo.svg'} alt="Logo" className=" h-10 mr-2" />
            
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-800 transition-colors font-medium">
                Strona główna
              </a>
              <a href="#features" className="text-gray-700 hover:text-blue-800 transition-colors font-medium">
                Funkcje
              </a>
              <a href="#benefits" className="text-gray-700 hover:text-blue-800 transition-colors font-medium">
                Korzyści
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-800 transition-colors font-medium">
                Kontakt
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin} className="text-gray-700 hover:text-blue-800">
                Zaloguj się
              </Button>
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-800">
                Rozpocznij za darmo
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur">
              <div className="py-4 space-y-4">
                <a href="#home" className="block text-gray-700 hover:text-blue-800 transition-colors">
                  Strona główna
                </a>
                <a href="#features" className="block text-gray-700 hover:text-blue-800 transition-colors">
                  Funkcje
                </a>
                <a href="#benefits" className="block text-gray-700 hover:text-blue-800 transition-colors">
                  Korzyści
                </a>
                <a href="#contact" className="block text-gray-700 hover:text-blue-800 transition-colors">
                  Kontakt
                </a>
                <div className="pt-4 space-y-2">
                  <Button variant="ghost" className="w-full" onClick={handleLogin}>
                    Zaloguj się
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-blue-800 to-blue-900" onClick={handleGetStarted}>
                    Rozpocznij za darmo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-purple-900/90">
        <div className="absolute inset-0 bg-grid-black/10 bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Rewolucja w nauce z <span className="text-orange-400">gamifikacją</span>
              </h1>
              
              <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
                Platforma edukacyjna nowej generacji, która zamienia naukę w ekscytującą przygodę. 
                Zdobywaj XP, odznaki i rywalizuj z innymi uczniami!
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-orange-400">{stat.number}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-800 hover:bg-gray-100 font-semibold"
                  onClick={handleGetStarted}
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Rozpocznij przygodę
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/80 text-white bg-white/10 hover:bg-white hover:text-blue-800 border-2 backdrop-blur-sm"
                >
                  Zobacz demo
                </Button>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <div className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-lg shadow-2xl p-6 text-white">
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white text-lg">
                      AK
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">Anna Kowalska</h3>
                      <Badge className="bg-orange-400/20 text-orange-300 border-orange-400/30">
                        <Trophy className="w-3 h-3 mr-1" />
                        Poziom 12
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-blue-100">
                      <span>Postęp w matematyce</span>
                      <span>1,250 / 1,500 XP</span>
                    </div>
                    <Progress value={83} className="h-3 bg-white/30 [&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-orange-500" />
                  </div>

                  <div className="flex items-center gap-2 text-orange-300">
                    <Flame className="w-5 h-5" />
                    <span className="text-sm">Aktualny streak: <strong className="text-orange-300">7 dni</strong></span>
                  </div>

                  <div>
                    <p className="text-sm mb-3 text-blue-100">Zdobyte odznaki:</p>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Dlaczego warto wybrać Smart Edu Play?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dołącz do tysięcy zadowolonych uczniów i nauczycieli
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Zaawansowane funkcje platformy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Wykorzystujemy najnowsze technologie i psychologię motywacji, aby uczynić naukę 
              bardziej angażującą i efektywną
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-gray-200 hover:bg-gradient-to-br hover:${feature.bgGradient}`}>
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900/90 via-blue-800/90 to-purple-900/90 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Gotowy na przygodę z nauką?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Dołącz do tysięcy uczniów, którzy już odkryli radość z gamifikowanej edukacji. 
            Pierwszy miesiąc całkowicie za darmo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-800 hover:bg-gray-100 font-semibold text-lg px-8 py-3"
              onClick={handleGetStarted}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Zacznij za darmo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/80 text-white bg-white/10 hover:bg-white hover:text-blue-800 border-2 text-lg px-8 py-3 backdrop-blur-sm"
            >
              Skontaktuj się z nami
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Smart Edu Play
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Rewolucjonizujemy edukację przez gamifikację i nowoczesne technologie.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Funkcje</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Cennik</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Wsparcie</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Dokumentacja</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Kontakt</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Firma</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">O nas</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Kariera</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Smart Edu Play. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}