// file: components/WiseAdsLanding.jsx
import { useState, useEffect } from "react";
import { Zap, Target, Star, Brain, Rocket, Skull, Flame } from "lucide-react";

const WiseAdsLanding = () => {
  const [_, setCurrentIndex] = useState(0);

  const heroWords = ["BUNTOWNIK", "REWOLUCJA", "DEMOLKA", "WOLNOŚĆ"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* System Section */}
      <section id="system" className="relative bg-gray-50 text-center">
        <div className="container mx-auto px-6 py-24 max-w-6xl flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-8">
            System tak prosty,
            <br />
            że to aż <span className="text-yellow-500">niesprawiedliwe</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-16 max-w-3xl">
            Nie potrzebujesz MBA, żeby stworzyć kampanię reklamową. Potrzebujesz
            3 kroków i odrobiny postpunkowego buntu.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Określ cel",
                desc: "Wklejasz URL, mówisz do kogo chcesz dotrzeć i ile masz budżetu. Koniec.",
                icon: <Target className="h-8 w-8" />,
              },
              {
                num: "02",
                title: "AI robi robotę",
                desc: "Nasz system generuje kreacje, teksty i targeting. Ty tylko sprawdzasz, czy nie jest za bardzo cringe.",
                icon: <Brain className="h-8 w-8" />,
              },
              {
                num: "03",
                title: "Czas na demolkę",
                desc: "Klikasz 'START' i zaczynasz demolować konkurencję. Wyniki widzisz w czasie rzeczywistym.",
                icon: <Rocket className="h-8 w-8" />,
              },
            ].map((step, index) => (
              <div key={index} className="bg-white p-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-gray-600">
                    {step.icon}
                  </div>
                </div>
                <div className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section
        id="manifesto"
        className="relative bg-black text-white text-center"
      >
        <div className="container mx-auto px-6 py-24 max-w-6xl flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-8">
            Manifest
            <br />
            <span className="text-yellow-400">anty-korporacyjny</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-16 max-w-3xl">
            Nasza religia? Prostota i transparentność. Koniec z systemem, który
            robi z Ciebie frajera.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Zero ściemy",
                desc: "Jeśli potrzebujesz podręcznika, by stworzyć reklamę, to znaczy, że ktoś robi Ci wodę z mózgu.",
              },
              {
                icon: <Skull className="h-8 w-8" />,
                title: "Śmierć agencjom",
                desc: "Przestań płacić agencjom za rzeczy, które możesz zrobić samodzielnie w 10 minut.",
              },
              {
                icon: <Flame className="h-8 w-8" />,
                title: "Spalmy pośredników",
                desc: "Twój sukces nie powinien zależeć od armii konsultantów i project managerów.",
              },
            ].map((feature, index) => (
              <div key={index} className="p-6">
                <div className="h-16 w-16 mx-auto mb-6 bg-yellow-400 text-black flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative bg-gray-50 text-center">
        <div className="container mx-auto px-6 py-24 max-w-4xl flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-8">
            Prawdziwe słowa od
            <br />
            <span className="text-yellow-500">prawdziwych rebeliantów</span>
          </h2>
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-lg font-medium text-gray-600">
              4.9/5 od 2,137 buntowników
            </span>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            "W końcu platforma, która nie traktuje mnie jak idioty." - Tomek,
            CEO startupu
          </p>
          <div className="flex justify-center -space-x-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-12 w-12 bg-gray-300 border-4 border-white rounded-full"
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="revolution"
        className="relative bg-black text-white text-center"
      >
        <div className="container mx-auto px-6 py-24 max-w-4xl flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-8">
            Gotów by
            <br />
            <span className="text-yellow-400">przejąć kontrolę?</span>
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed mb-12 max-w-3xl text-gray-300">
            Dołącz do tysięcy rebeliantów, którzy wypięli się na tradycyjny
            marketing i zaczęli robić rzeczy po swojemu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
            <button className="bg-yellow-400 text-black px-8 py-4 text-xl font-bold">
              Rozpocznij rewolucję
            </button>
            <button className="border border-white text-white px-8 py-4 text-xl font-bold">
              Pokaż mi demo
            </button>
          </div>
          <p className="text-sm text-gray-400">
            14 dni za darmo • Bez korporacyjnych gierek • Anuluj, kiedy chcesz
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white text-center">
        <div className="container mx-auto px-6 py-12 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-black flex items-center justify-center">
              <Skull className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">WiseAds</span>
            <span className="text-sm text-gray-500 flex items-center">
              © 2025 Made with ❤️ and{" "}
              <Flame className="h-4 w-4 ml-1 text-yellow-500" />
            </span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-black">
              Prywatność
            </a>
            <a href="#" className="hover:text-black">
              Regulamin
            </a>
            <a href="#" className="hover:text-black">
              Kontakt
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WiseAdsLanding;
