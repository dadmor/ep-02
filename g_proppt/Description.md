
---

## **Role i zakres CRUD w EduPlay (wersja skrócona):**

---

### 1. Uczeń

* **C (Create):**

  * Zakłada konto ucznia (rejestracja)
  * Rozpoczyna nową lekcję (rozpoczęcie sesji ćwiczeń)
* **R (Read):**

  * Przegląda dostępne lekcje i poziomy (zakładka 1)
  * Przegląda swój profil (XP, streak, odznaki) (zakładka 3)
  * Podgląda ranking uczniów (zakładka 4)
* **U (Update):**

  * Uzupełnia dane profilu (avatar, pseudonim)
  * Uzupełnia/aktualizuje odpowiedzi w trakcie lekcji
* **D (Delete):**

  * Może usunąć własne konto

---

### 2. Nauczyciel

* **C:**

  * Tworzy nową lekcję (zakładka 2)
  * Dodaje zadania (quizy) do lekcji
* **R:**

  * Przegląda swoje lekcje i ich status (zakładka 2)
  * Podgląda postępy uczniów (zakładka 5)
* **U:**

  * Edytuje treść lekcji i zadań
  * Aktualizuje informacje o uczniach przypisanych do klasy
* **D:**

  * Usuwa własne lekcje i zadania (jeśli nie zostały ukończone)

---

### 3. Administrator

* **C:**

  * Dodaje nowych nauczycieli (ręcznie lub na zaproszenie)
  * Definiuje zasady grywalizacji (np. XP za zadanie, progi poziomów)
* **R:**

  * Przegląda wszystkich użytkowników, lekcje, statystyki globalne (zakładka 6)
* **U:**

  * Modyfikuje role użytkowników
  * Aktualizuje konfigurację systemu (np. treści systemowe, odznaki)
* **D:**

  * Dezaktywuje konta użytkowników lub usuwa treści naruszające regulamin

---

## **Lista zakładek i pól formularzy:**

---

### **Zakładka 1: Przegląd lekcji (Uczeń)**

* Lista lekcji (nazwa, opis, poziom)
* Status ukończenia
* Przycisk „Rozpocznij”

---

### **Zakładka 2: Zarządzanie lekcjami (Nauczyciel)**

* Formularz dodania lekcji:

  1. Tytuł lekcji
  2. Opis
  3. Poziom trudności
  4. Kategoria
  5. Przycisk „Dodaj zadanie”

* Formularz dodania zadania:

  1. Typ zadania (quiz jednokrotnego wyboru, uzupełnianie, dopasowanie)
  2. Pytanie
  3. Lista opcji (jeśli quiz)
  4. Poprawna odpowiedź
  5. XP za zadanie

---

### **Zakładka 3: Profil ucznia**

* Awatar
* Nazwa użytkownika
* Poziom i XP
* Aktualny streak
* Lista zdobytych odznak (ikona, nazwa, data)

---

### **Zakładka 4: Ranking uczniów**

* Lista uczniów w danej klasie/grupie
* Pozycja w rankingu
* Poziom, XP, streak

---

### **Zakładka 5: Postępy uczniów (Nauczyciel)**

* Lista uczniów przypisanych do nauczyciela
* Pasek postępu dla każdej lekcji
* Szczegóły wyników (score, czas, streak)

---

### **Zakładka 6: Panel administracyjny**

* Lista wszystkich użytkowników (z rolami)
* Statystyki: liczba aktywnych uczniów, wykonane lekcje, dzienne streaki
* Ustawienia globalne:

  * Progi XP do poziomów
  * Konfiguracja odznak
  * Limity dzienne

---

## **Uwagi ogólne:**

* Punkty XP przyznawane są automatycznie po poprawnym ukończeniu zadania.
* Streak zwiększa się codziennie po wykonaniu dowolnego zadania (resetowany po 24h braku aktywności).
* Odznaki są przydzielane warunkowo (np. za pierwszy streak, 100% poprawnych odpowiedzi, 5 dni aktywności).
* Wszystkie działania ucznia zapisywane są w tabeli `progress`, wykorzystywanej do rankingu, awansów i statystyk.

---

