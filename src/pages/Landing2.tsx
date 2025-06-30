import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';

export default function WiseAdsLanding() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouse = (e: Event) => setMousePos({ x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY });
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Subtle Background Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255_/_0.15)_1px,transparent_0)] [background-size:24px_24px] pointer-events-none" />
      
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at ${mousePos.x * 0.1}% ${mousePos.y * 0.1}%, hsl(var(--primary)) 0%, transparent 90%),
            radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0%, transparent 30%),
            radial-gradient(circle at 40% 80%, hsl(var(--ring)) 0%, transparent 30%),
            linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 50%)
          `
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-8">
        <div 
          className="text-center max-w-6xl mx-auto space-y-8"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <div className="space-y-6">
            <Badge variant="secondary" className="text-sm px-3 py-1 font-medium border-0">
              <Zap className="w-4 h-4 mr-2" />
              Platforma Audytu Energetycznego
            </Badge>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground">
              EOPERATOR
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl font-normal text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Kompleksowe wsparcie{' '}
              <span className="text-foreground font-medium">
                procesu audytu energetycznego
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="text-base px-8 py-3 h-12 group">
              Rozpocznij Audyt
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="outline" size="lg" className="text-base px-8 py-3 h-12">
              Zobacz Platform
            </Button>
          </div>
        </div>
      </section>

      {/* Section 1 - Intelligence */}
      <section className="relative py-24 px-4 md:px-8 bg-card border-y">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="text-xs px-3 py-1 font-mono uppercase tracking-wide">
                  Analiza Energetyczna
                </Badge>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  Precyzyjny{' '}
                  <span className="text-muted-foreground">Audyt</span>
                </h2>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Nasze narzędzia analizują zużycie energii w 360 stopniach, 
                identyfikując obszary optymalizacji i potencjał oszczędności.
              </p>
              
              <Button variant="outline" size="lg" className="mt-6">
                Zobacz Metodologię
              </Button>
            </div>
            
            <div className="relative">
              <Card className="border-2 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className="text-xs font-mono">LIVE</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="text-4xl font-black">92.4%</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                      Dokładność Audytu
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Efektywność Energetyczna</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" style={{width: '92%'}} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Potencjał Oszczędności</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary/70 h-2 rounded-full transition-all duration-1000 ease-out delay-200" style={{width: '78%'}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Performance */}
      <section className="relative py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-lg bg-emerald-500/10">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono">
                      GROWTH
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="text-4xl font-black text-emerald-600">-45%</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                      Redukcja Zużycia Energii
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Oszczędność Kosztów</span>
                        <span className="font-medium text-emerald-600">-45%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-1000 ease-out" style={{width: '85%'}} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Redukcja CO₂</span>
                        <span className="font-medium text-blue-600">-38%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-1000 ease-out delay-300" style={{width: '67%'}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-4">
                <Badge variant="outline" className="text-xs px-3 py-1 font-mono uppercase tracking-wide">
                  Optymalizacja Energii
                </Badge>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  Oszczędności{' '}
                  <span className="text-muted-foreground">Maksymalne</span>
                </h2>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Kompleksowa platforma wspierająca cały proces audytu energetycznego - 
                od analizy po implementację rozwiązań energooszczędnych.
              </p>
              
              <div className="flex gap-4 pt-4">
                <Button size="lg">
                  Rozpocznij Audyt
                </Button>
                <Button variant="ghost" size="lg" className="group">
                  Studia Przypadków
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 md:px-8 border-t mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <h3 className="text-3xl font-black tracking-tight">
              EOPERATOR
            </h3>
            
            <nav className="flex flex-wrap justify-center gap-8">
              <Button variant="ghost" size="sm" className="text-base">
                Platforma
              </Button>
              <Button variant="ghost" size="sm" className="text-base">
                Audyty
              </Button>
              <Button variant="ghost" size="sm" className="text-base">
                Cennik
              </Button>
              <Button variant="ghost" size="sm" className="text-base">
                Kontakt
              </Button>
            </nav>
            
            <div className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                © 2025 EOPERATOR. Kompleksowe wsparcie audytu energetycznego.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}