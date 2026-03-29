import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_BG = "https://cdn.poehali.dev/projects/d712c762-63b0-49d0-9843-525135dcbeff/files/2e306825-116f-4f90-b8fe-14174863d64d.jpg";
const PARTS_BG = "https://cdn.poehali.dev/projects/d712c762-63b0-49d0-9843-525135dcbeff/files/93ac4e93-ccfd-49b9-9c20-1d380c8e8cb9.jpg";

type Page = "home" | "catalog" | "cars" | "contacts";

const PARTS_DATA = [
  { id: 1, name: "Двигатель 2.0 TDI", car: "Volkswagen Passat B7", category: "Двигатель", price: "45 000", stock: 2 },
  { id: 2, name: "АКПП 6-ступ", car: "BMW 5 Series F10", category: "КПП", price: "38 000", stock: 1 },
  { id: 3, name: "Передний бампер", car: "Toyota Camry V70", category: "Кузов", price: "8 500", stock: 5 },
  { id: 4, name: "Рулевая рейка", car: "Audi A4 B9", category: "Ходовая", price: "12 000", stock: 0 },
  { id: 5, name: "Фара левая LED", car: "Mercedes E-Class W213", category: "Оптика", price: "22 000", stock: 3 },
  { id: 6, name: "Капот", car: "Honda Accord X", category: "Кузов", price: "11 000", stock: 2 },
  { id: 7, name: "Генератор 180А", car: "Ford Focus III", category: "Электрика", price: "7 500", stock: 1 },
  { id: 8, name: "Задняя балка", car: "Hyundai Tucson TL", category: "Ходовая", price: "18 000", stock: 4 },
  { id: 9, name: "Стойка передняя", car: "Kia Sportage IV", category: "Ходовая", price: "5 800", stock: 0 },
  { id: 10, name: "Радиатор охлаждения", car: "Skoda Octavia A7", category: "Охлаждение", price: "9 200", stock: 2 },
  { id: 11, name: "Дверь задняя правая", car: "Volkswagen Tiguan II", category: "Кузов", price: "14 000", stock: 1 },
  { id: 12, name: "Подушка безопасности", car: "Toyota RAV4 CA40", category: "Безопасность", price: "6 500", stock: 3 },
];

const CARS_DATA = [
  { id: 1, make: "BMW", model: "5 Series F10", year: 2013, mileage: "210 000", color: "Чёрный", status: "В разборке", parts: 47 },
  { id: 2, make: "Volkswagen", model: "Passat B7", year: 2014, mileage: "185 000", color: "Серебристый", status: "В разборке", parts: 63 },
  { id: 3, make: "Toyota", model: "Camry V70", year: 2019, mileage: "95 000", color: "Белый", status: "Поступит скоро", parts: 0 },
  { id: 4, make: "Mercedes", model: "E-Class W213", year: 2017, mileage: "142 000", color: "Синий", status: "В разборке", parts: 38 },
  { id: 5, make: "Audi", model: "A4 B9", year: 2016, mileage: "178 000", color: "Серый", status: "В разборке", parts: 52 },
  { id: 6, make: "Honda", model: "Accord X", year: 2018, mileage: "118 000", color: "Чёрный", status: "В разборке", parts: 29 },
];

const CATEGORIES = ["Все", "Двигатель", "КПП", "Кузов", "Ходовая", "Оптика", "Электрика", "Охлаждение", "Безопасность"];

const getStockStatus = (qty: number) => {
  if (qty === 0) return { label: "Нет в наличии", cls: "status-out" };
  if (qty <= 1) return { label: "Мало", cls: "status-low" };
  return { label: "В наличии", cls: "status-available" };
};

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [stocks, setStocks] = useState<Record<number, number>>(
    Object.fromEntries(PARTS_DATA.map(p => [p.id, p.stock]))
  );

  const filtered = PARTS_DATA.filter(p => {
    const matchCat = category === "Все" || p.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.car.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const nav = (p: Page) => { setPage(p); setMobileMenu(false); window.scrollTo(0, 0); };

  const navLabels: Record<Page, string> = { home: "Главная", catalog: "Каталог", cars: "Авто в наличии", contacts: "Контакты" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--metal-dark)" }}>

      {/* ─── NAVBAR ─── */}
      <nav style={{ background: "rgba(8,8,8,0.97)", borderBottom: "1px solid var(--metal-shine)" }} className="sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => nav("home")} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 flex-shrink-0" style={{ background: "var(--rust-red)" }}>
                <Icon name="Wrench" size={18} className="text-white" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm tracking-widest" style={{ fontFamily: "Oswald", textTransform: "uppercase", letterSpacing: "0.15em" }}>МеталлЧасть</div>
                <div className="text-xs" style={{ color: "var(--steel-gray)", fontFamily: "Roboto" }}>Разборка автомобилей</div>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-8">
              {(["home", "catalog", "cars", "contacts"] as Page[]).map(p => (
                <button key={p} onClick={() => nav(p)} className={`nav-link ${page === p ? "active" : ""}`}>{navLabels[p]}</button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Icon name="Phone" size={14} style={{ color: "var(--rust-red)" }} />
              <a href="tel:+78001234567" className="text-sm font-medium" style={{ color: "var(--chrome)", fontFamily: "Oswald", letterSpacing: "0.05em" }}>
                8 800 123-45-67
              </a>
            </div>

            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              <Icon name={mobileMenu ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div style={{ background: "var(--metal-mid)", borderTop: "1px solid var(--metal-shine)" }} className="md:hidden px-4 py-4 flex flex-col gap-4">
            {(["home", "catalog", "cars", "contacts"] as Page[]).map(p => (
              <button key={p} onClick={() => nav(p)} className={`nav-link text-left ${page === p ? "active" : ""}`}>{navLabels[p]}</button>
            ))}
            <a href="tel:+78001234567" className="text-sm font-semibold" style={{ color: "var(--rust-orange)", fontFamily: "Oswald" }}>8 800 123-45-67</a>
          </div>
        )}
      </nav>

      {/* ─── HOME ─── */}
      {page === "home" && (
        <div>
          {/* Hero */}
          <section className="relative overflow-hidden flex flex-col justify-center" style={{ minHeight: "92vh" }}>
            <div className="absolute inset-0">
              <img src={HERO_BG} alt="разборка" className="w-full h-full object-cover" style={{ opacity: 0.32 }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, rgba(8,8,8,0.65) 60%, #0f0f0f 100%)" }} />
              <div className="absolute inset-0 hero-grid" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-20">
              <div className="max-w-3xl">
                <div className="fade-in flex items-center gap-3 mb-6">
                  <div className="h-px w-12" style={{ background: "var(--rust-red)" }} />
                  <span className="text-xs tracking-widest" style={{ color: "var(--rust-orange)", fontFamily: "Oswald", textTransform: "uppercase", letterSpacing: "0.25em" }}>
                    Авторазборка с 2009 года
                  </span>
                </div>

                <h1 className="fade-in-delay-1 font-bold text-white leading-none mb-6" style={{ fontFamily: "Oswald", fontSize: "clamp(2.5rem, 8vw, 5rem)" }}>
                  ЗАПЧАСТИ<br />
                  <span style={{ color: "var(--rust-red)" }}>БЕЗ НАЦЕНОК</span><br />
                  И ОБМАНА
                </h1>

                <p className="fade-in-delay-2 text-base sm:text-lg mb-10 max-w-xl" style={{ color: "var(--chrome)", fontFamily: "Roboto", fontWeight: 300, lineHeight: 1.7 }}>
                  Более 5000 запчастей в наличии. Разборка легковых и коммерческих авто. Гарантия 30 дней на все детали. Самовывоз и доставка по РФ.
                </p>

                <div className="fade-in-delay-3 flex flex-wrap gap-4">
                  <button className="btn-primary" onClick={() => nav("catalog")}>Найти запчасть</button>
                  <button className="btn-secondary" onClick={() => nav("cars")}>Авто в разборке</button>
                </div>
              </div>

              <div className="fade-in-delay-4 mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4" style={{ border: "1px solid var(--metal-shine)", maxWidth: 640 }}>
                {[
                  { n: "5 000+", l: "Запчастей" },
                  { n: "200+", l: "Авто разобрано" },
                  { n: "15 лет", l: "На рынке" },
                  { n: "100%", l: "Гарантия" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center justify-center py-6 px-4" style={{ background: "rgba(20,20,20,0.9)", borderRight: i < 3 ? "1px solid var(--metal-shine)" : "none" }}>
                    <div className="counter-number text-3xl">{s.n}</div>
                    <div className="text-xs mt-1 tracking-widest" style={{ color: "var(--steel-gray)", fontFamily: "Oswald", textTransform: "uppercase" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="section-divider" />

          {/* Why us */}
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
            <h2 className="section-title text-3xl sm:text-4xl font-bold text-white mb-12">Почему выбирают нас</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "ShieldCheck", title: "Гарантия 30 дней", desc: "На каждую деталь выдаём чек и гарантийный талон" },
                { icon: "PackageSearch", title: "Проверка на стенде", desc: "Каждая запчасть проверяется перед продажей" },
                { icon: "Truck", title: "Доставка по РФ", desc: "Отправляем транспортными компаниями в любой регион" },
                { icon: "Headphones", title: "Консультация", desc: "Подберём аналог и проверим совместимость бесплатно" },
              ].map((item, i) => (
                <div key={i} className="part-card p-6">
                  <div className="w-10 h-10 flex items-center justify-center mb-4" style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)" }}>
                    <Icon name={item.icon} size={20} style={{ color: "var(--rust-red)" }} />
                  </div>
                  <h3 className="text-white text-base font-semibold mb-2" style={{ fontFamily: "Oswald" }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--steel-gray)", fontFamily: "Roboto", fontWeight: 300 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="section-divider" />

          {/* Popular parts */}
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <h2 className="section-title text-3xl sm:text-4xl font-bold text-white">Популярные запчасти</h2>
              <button className="btn-secondary text-xs self-start" onClick={() => nav("catalog")}>Весь каталог →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PARTS_DATA.slice(0, 6).map((part) => {
                const st = getStockStatus(stocks[part.id]);
                return (
                  <div key={part.id} className="part-card p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs tracking-widest" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>{part.category}</span>
                      <span className={st.cls}>{st.label}</span>
                    </div>
                    <h3 className="text-white text-base font-semibold mb-1" style={{ fontFamily: "Oswald" }}>{part.name}</h3>
                    <p className="text-xs mb-4" style={{ color: "var(--steel-gray)" }}>{part.car}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold" style={{ color: "var(--rust-orange)", fontFamily: "Oswald" }}>{part.price} ₽</span>
                      <button className="btn-primary text-xs py-2 px-4" onClick={() => nav("contacts")}>Заказать</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="section-divider" />

          {/* CTA */}
          <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0">
              <img src={PARTS_BG} alt="запчасти" className="w-full h-full object-cover" style={{ opacity: 0.18 }} />
              <div className="absolute inset-0" style={{ background: "rgba(8,8,8,0.85)" }} />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6" style={{ fontFamily: "Oswald" }}>
                НЕ НАШЛИ<br /><span style={{ color: "var(--rust-red)" }}>НУЖНУЮ ДЕТАЛЬ?</span>
              </h2>
              <p className="mb-8 text-base leading-relaxed" style={{ color: "var(--chrome)", fontFamily: "Roboto", fontWeight: 300 }}>
                Оставьте заявку — найдём нужную запчасть в течение 24 часов или подберём аналог
              </p>
              <button className="btn-primary text-base px-10 py-4" onClick={() => nav("contacts")}>Оставить заявку</button>
            </div>
          </section>
        </div>
      )}

      {/* ─── CATALOG ─── */}
      {page === "catalog" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="mb-8">
            <h1 className="section-title text-3xl sm:text-4xl font-bold text-white mb-2">Каталог запчастей</h1>
            <p className="text-sm" style={{ color: "var(--steel-gray)" }}>{filtered.length} позиций найдено</p>
          </div>

          {/* Admin toggle */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="text-xs tracking-widest" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>УПРАВЛЕНИЕ ОСТАТКАМИ:</span>
            <button
              onClick={() => setAdminMode(!adminMode)}
              className="relative w-12 h-6 transition-all duration-300"
              style={{ background: adminMode ? "var(--rust-red)" : "var(--metal-shine)" }}
            >
              <div className="absolute top-1 w-4 h-4 bg-white transition-all duration-300" style={{ left: adminMode ? "calc(100% - 20px)" : "4px" }} />
            </button>
            {adminMode && <span className="text-xs" style={{ color: "var(--rust-orange)", fontFamily: "Oswald" }}>РЕЖИМ РЕДАКТИРОВАНИЯ АКТИВЕН</span>}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--steel-gray)" }} />
            <input className="search-input pl-11" placeholder="Поиск по названию, марке авто, категории..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-btn ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((part) => {
              const qty = stocks[part.id];
              const st = getStockStatus(qty);
              return (
                <div key={part.id} className="part-card p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs tracking-widest" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>{part.category}</span>
                    <span className={st.cls}>{st.label}</span>
                  </div>
                  <h3 className="text-white text-sm font-semibold mb-1" style={{ fontFamily: "Oswald" }}>{part.name}</h3>
                  <p className="text-xs mb-3" style={{ color: "var(--steel-gray)" }}>{part.car}</p>

                  {adminMode ? (
                    <div className="mb-3 mt-auto">
                      <div className="text-xs mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>ОСТАТОК НА СКЛАДЕ</div>
                      <div className="flex items-center gap-2">
                        <button
                          className="w-9 h-9 text-white font-bold text-lg flex items-center justify-center transition-colors"
                          style={{ background: "var(--metal-shine)", border: "1px solid var(--metal-shine)" }}
                          onClick={() => setStocks(s => ({ ...s, [part.id]: Math.max(0, s[part.id] - 1) }))}
                        >−</button>
                        <div className="flex-1 text-center text-white font-bold text-xl" style={{ fontFamily: "Oswald", background: "var(--metal-light)", padding: "4px 0", border: "1px solid var(--metal-shine)" }}>{qty}</div>
                        <button
                          className="w-9 h-9 text-white font-bold text-lg flex items-center justify-center transition-colors"
                          style={{ background: "var(--rust-red)", border: "1px solid var(--rust-red)" }}
                          onClick={() => setStocks(s => ({ ...s, [part.id]: s[part.id] + 1 }))}
                        >+</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs mb-3" style={{ color: "var(--steel-gray)" }}>
                      В наличии: <span className="font-semibold" style={{ color: qty > 0 ? "var(--chrome)" : "var(--rust-red)" }}>{qty} шт.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid var(--metal-shine)" }}>
                    <span className="text-lg font-bold" style={{ color: "var(--rust-orange)", fontFamily: "Oswald" }}>{part.price} ₽</span>
                    {!adminMode && (
                      <button
                        className="btn-primary text-xs py-2 px-3"
                        style={{ opacity: qty === 0 ? 0.45 : 1, cursor: qty === 0 ? "not-allowed" : "pointer" }}
                        onClick={() => qty > 0 && nav("contacts")}
                      >
                        {qty === 0 ? "Нет" : "Заказать"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <Icon name="PackageSearch" size={56} className="mx-auto mb-4" style={{ color: "var(--metal-shine)" }} />
              <p className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Oswald" }}>Ничего не найдено</p>
              <p className="text-sm mb-6" style={{ color: "var(--steel-gray)" }}>Попробуйте другой запрос или оставьте заявку</p>
              <button className="btn-primary" onClick={() => nav("contacts")}>Оставить заявку</button>
            </div>
          )}
        </div>
      )}

      {/* ─── CARS ─── */}
      {page === "cars" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="mb-10">
            <h1 className="section-title text-3xl sm:text-4xl font-bold text-white mb-2">Автомобили в разборке</h1>
            <p className="text-sm" style={{ color: "var(--steel-gray)" }}>Актуальный список авто — запросите любую запчасть</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CARS_DATA.map((car) => (
              <div key={car.id} className="car-card">
                <div className="relative flex flex-col items-center justify-center" style={{ height: 180, background: "var(--metal-light)" }}>
                  <div className="absolute inset-0 hero-grid opacity-40" />
                  <Icon name="Car" size={72} style={{ color: "var(--metal-shine)", position: "relative" }} />
                  <span className="text-xs mt-2 tracking-widest relative" style={{ color: "var(--steel-gray)", fontFamily: "Oswald", textTransform: "uppercase" }}>{car.make}</span>

                  <div className="absolute top-3 right-3">
                    <span style={{ padding: "2px 8px", fontFamily: "Oswald", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
                      className={car.status === "В разборке" ? "status-available" : "status-low"}>
                      {car.status}
                    </span>
                  </div>

                  {car.parts > 0 && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 text-white" style={{ background: "rgba(192,57,43,0.85)", fontFamily: "Oswald", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
                      {car.parts} ЗАПЧАСТЕЙ
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-white text-xl font-bold mb-3" style={{ fontFamily: "Oswald" }}>{car.make} {car.model}</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { l: "Год", v: String(car.year) },
                      { l: "Пробег", v: car.mileage + " км" },
                      { l: "Цвет", v: car.color },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="text-xs mb-1" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>{item.l}</div>
                        <div className="text-sm text-white font-medium">{item.v}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-secondary w-full text-center text-xs" onClick={() => nav("contacts")}>
                    Запросить запчасть
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-10 text-center" style={{ border: "1px dashed var(--metal-shine)", background: "rgba(20,20,20,0.6)" }}>
            <Icon name="Car" size={36} className="mx-auto mb-4" style={{ color: "var(--rust-orange)", opacity: 0.5 }} />
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Oswald" }}>Продаёте авто на запчасти?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--steel-gray)" }}>Предложим цену за ваш автомобиль в течение 1 часа</p>
            <button className="btn-primary" onClick={() => nav("contacts")}>Предложить авто</button>
          </div>
        </div>
      )}

      {/* ─── CONTACTS ─── */}
      {page === "contacts" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="mb-10">
            <h1 className="section-title text-3xl sm:text-4xl font-bold text-white mb-2">Контакты</h1>
            <p className="text-sm" style={{ color: "var(--steel-gray)" }}>Приезжайте или свяжитесь удобным способом</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                { icon: "Phone", label: "Телефон", value: "8 800 123-45-67", sub: "Бесплатно по РФ • Пн–Вс 8:00–20:00" },
                { icon: "MessageCircle", label: "WhatsApp / Telegram", value: "+7 (900) 123-45-67", sub: "Ответ в течение 15 минут" },
                { icon: "MapPin", label: "Адрес", value: "г. Москва, ул. Промышленная, 45", sub: "Пн–Сб 8:00–20:00 • Вс 9:00–17:00" },
                { icon: "Mail", label: "Email", value: "info@metallchast.ru", sub: "Для юридических лиц и опта" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5" style={{ background: "var(--metal-mid)", border: "1px solid var(--metal-shine)" }}>
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)" }}>
                    <Icon name={item.icon} size={18} style={{ color: "var(--rust-red)" }} />
                  </div>
                  <div>
                    <div className="text-xs tracking-wider mb-1" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>{item.label}</div>
                    <div className="text-white font-semibold mb-0.5" style={{ fontFamily: "Oswald" }}>{item.value}</div>
                    <div className="text-xs" style={{ color: "var(--steel-gray)" }}>{item.sub}</div>
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div className="flex flex-col items-center justify-center gap-3" style={{ height: 200, background: "var(--metal-mid)", border: "1px solid var(--metal-shine)", position: "relative", overflow: "hidden" }}>
                <div className="absolute inset-0 hero-grid opacity-30" />
                <Icon name="MapPin" size={36} style={{ color: "var(--rust-red)", position: "relative" }} />
                <div className="relative text-white font-semibold text-sm" style={{ fontFamily: "Oswald" }}>г. Москва, ул. Промышленная, 45</div>
                <div className="relative text-xs" style={{ color: "var(--steel-gray)" }}>Карта подключается по запросу</div>
              </div>
            </div>

            {/* Form */}
            <div className="p-7" style={{ background: "var(--metal-mid)", border: "1px solid var(--metal-shine)" }}>
              <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "Oswald" }}>Оставить заявку</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>ИМЯ</label>
                  <input className="search-input" placeholder="Ваше имя" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>ТЕЛЕФОН</label>
                  <input className="search-input" placeholder="+7 (___) ___-__-__" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>НУЖНАЯ ЗАПЧАСТЬ</label>
                  <input className="search-input" placeholder="Напишите что ищете..." />
                </div>
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>МАРКА И МОДЕЛЬ АВТО</label>
                  <input className="search-input" placeholder="Пример: Toyota Camry 2018" />
                </div>
                <button className="btn-primary w-full text-center mt-2">Отправить заявку</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="mt-20" style={{ background: "#080808", borderTop: "2px solid var(--rust-red)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-white font-bold text-lg mb-3" style={{ fontFamily: "Oswald", letterSpacing: "0.15em" }}>МЕТАЛЛЧАСТЬ</div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--steel-gray)", fontFamily: "Roboto", fontWeight: 300 }}>
                Авторазборка с 15-летним опытом. Качественные запчасти с гарантией для любого автомобиля.
              </p>
            </div>
            <div>
              <div className="text-xs tracking-widest mb-4" style={{ color: "var(--rust-red)", fontFamily: "Oswald" }}>РАЗДЕЛЫ</div>
              {(["home", "catalog", "cars", "contacts"] as Page[]).map(p => (
                <button key={p} onClick={() => nav(p)} className="block text-sm mb-2 text-left hover:text-white transition-colors" style={{ color: "var(--steel-gray)", fontFamily: "Roboto" }}>
                  {navLabels[p]}
                </button>
              ))}
            </div>
            <div>
              <div className="text-xs tracking-widest mb-4" style={{ color: "var(--rust-red)", fontFamily: "Oswald" }}>РЕЖИМ РАБОТЫ</div>
              <div className="text-sm space-y-1" style={{ color: "var(--steel-gray)", fontFamily: "Roboto" }}>
                <p>Пн–Сб: 8:00 — 20:00</p>
                <p>Вс: 9:00 — 17:00</p>
                <p className="mt-3 font-medium" style={{ color: "var(--chrome)" }}>8 800 123-45-67</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--metal-shine)", paddingTop: "1.5rem" }}>
            <p className="text-xs text-center" style={{ color: "var(--steel-gray)" }}>© 2024 МеталлЧасть. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}