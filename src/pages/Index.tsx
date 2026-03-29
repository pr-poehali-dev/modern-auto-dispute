import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_BG = "https://cdn.poehali.dev/projects/d712c762-63b0-49d0-9843-525135dcbeff/files/2e306825-116f-4f90-b8fe-14174863d64d.jpg";
const PARTS_BG = "https://cdn.poehali.dev/projects/d712c762-63b0-49d0-9843-525135dcbeff/files/93ac4e93-ccfd-49b9-9c20-1d380c8e8cb9.jpg";
const API_URL = "https://functions.poehali.dev/7f90d170-c74d-4482-a06b-1bb83d4c98f4";

type Page = "home" | "request" | "contacts" | "privacy";

// Группы марок по странам для select
const MAKES_BY_COUNTRY: Record<string, string[]> = {
  "🇩🇪 Германия":        ["Mercedes-Benz","BMW","Volkswagen","Audi","Opel","Porsche","Maybach","Trabant","Wartburg","Brabus","RUF","MAN","Daimler","Alpina","Borgward"],
  "🇯🇵 Япония":          ["Toyota","Honda","Nissan","Mazda","Subaru","Mitsubishi","Suzuki","Daihatsu","Isuzu","Lexus","Infiniti","Acura","Mitsuoka","Hino","Fuso","UD Trucks"],
  "🇰🇷 Южная Корея":     ["Hyundai","Kia","Genesis","SsangYong","Daewoo","Renault Samsung","Samsung Motors"],
  "🇺🇸 США":             ["Ford","Chevrolet","Cadillac","Lincoln","Dodge","Jeep","Chrysler","Buick","Tesla","Corvette","Mustang","Shelby","Saleen","GMC","RAM","Rivian","Lucid","Karma","Fisker","Hennessey","SSC North America","Pontiac","Oldsmobile","Saturn","Hummer"],
  "🇬🇧 Великобритания":  ["Rolls-Royce","Bentley","Jaguar","Land Rover","Aston Martin","McLaren","Lotus","TVR","Morgan","Noble","Mini","Ariel","BAC","Vauxhall","Austin","MG","Caterham","Radical","Triumph"],
  "🇮🇹 Италия":          ["Fiat","Ferrari","Lamborghini","Maserati","Alfa Romeo","Pagani","Lancia","De Tomaso","Bizzarrini","Autobianchi","Dallara","Isotta Fraschini","Innocenti","Pininfarina","Bertone"],
  "🇫🇷 Франция":         ["Peugeot","Renault","Citroën","DS","Bugatti","Alpine","Venturi","Talbot","Panhard","Simca"],
  "🇸🇪 Швеция":          ["Volvo","SAAB","Koenigsegg","Scania"],
  "🇨🇿 Чехия":           ["Skoda","Tatra"],
  "🇷🇴 Румыния":         ["Dacia","ARO"],
  "🇵🇱 Польша":          ["FSO","Polonez","Arrinera"],
  "🇷🇺 Россия и СССР":   ["ВАЗ (Lada)","ГАЗ (Волга)","УАЗ","Москвич","ЗАЗ (Запорожец)","ЗИЛ","Чайка","КАМАЗ","МАЗ","Урал","БЕЛАЗ","Аурус","Соллерс"],
  "🇨🇳 Китай":           ["BYD","Geely","Chery","Great Wall","Haval","SAIC","FAW","Dongfeng","BAIC","Changan","Hongqi","GAC","Nio","Xpeng","Li Auto","Wuling","Zotye","JAC","Foton","HOWO","Zeekr","VOYAH","Ora","WEY","Lynk Co","Aion","Roewe","MG China","Baojun","Trumpchi"],
  "🇮🇳 Индия":           ["Tata Motors","Mahindra","Maruti Suzuki","Hindustan Motors","Force Motors","Ambassador"],
  "🇪🇸 Испания":         ["SEAT","Hispano-Suiza"],
  "🇳🇱 Нидерланды":      ["DAF","Spyker","Donkervoort"],
  "🇦🇹 Австрия":         ["Steyr","KTM"],
  "🇧🇪 Бельгия":         ["Minerva","Imperia"],
  "🇦🇺 Австралия":       ["Holden","Elfin","HSV"],
  "🇧🇷 Бразилия":        ["Embraer","Agrale","Troller"],
  "🇮🇷 Иран":            ["Iran Khodro","SAIPA","Bahman"],
  "🇹🇷 Турция":          ["TOGG","Anadol"],
  "🇺🇦 Украина":         ["ЗАЗ (Украина)","КрАЗ","ЛАЗ"],
  "🇰🇿 Казахстан":       ["Sarbaz","Asia Auto"],
  "🌍 Другие страны":    ["Rimac","Tauro","Proton","Perodua","Naza"],
};

// База детальных моделей и поколений для популярных марок
const CAR_DB: Record<string, Record<string, string[]>> = {
  "Toyota": {
    "Camry":        ["V40 (2006–2011)","V50 (2011–2017)","V70 (2017–2021)","V75 (2021–н.в.)"],
    "Corolla":      ["E140 (2007–2013)","E150 (2007–2013)","E160 (2013–2019)","E210 (2019–н.в.)"],
    "RAV4":         ["CA20 (2000–2006)","CA30 (2006–2012)","CA40 (2012–2018)","CA50 (2018–н.в.)"],
    "Land Cruiser": ["100 (1998–2007)","200 (2007–2021)","300 (2021–н.в.)"],
    "Highlander":   ["XU20 (2001–2007)","XU40 (2007–2013)","XU50 (2013–2019)","XU70 (2019–н.в.)"],
    "Yaris":        ["XP10 (1999–2005)","XP90 (2005–2011)","XP130 (2011–2020)","XP210 (2020–н.в.)"],
    "Prius":        ["I (1997–2003)","II (2003–2009)","III (2009–2015)","IV (2015–2022)","V (2023–н.в.)"],
    "C-HR":         ["I (2016–2023)","II (2023–н.в.)"],
  },
  "Honda": {
    "Accord":   ["VI (1997–2002)","VII (2002–2008)","VIII (2007–2012)","IX (2012–2017)","X (2017–н.в.)"],
    "CR-V":     ["I (1995–2001)","II (2001–2006)","III (2006–2012)","IV (2012–2016)","V (2016–н.в.)"],
    "Civic":    ["VII (2000–2005)","VIII (2005–2011)","IX (2011–2015)","X (2015–2021)","XI (2021–н.в.)"],
    "Pilot":    ["I (2002–2008)","II (2008–2015)","III (2015–2022)","IV (2022–н.в.)"],
    "Jazz/Fit": ["I (2001–2008)","II (2008–2014)","III (2014–2020)","IV (2020–н.в.)"],
  },
  "Nissan": {
    "Qashqai": ["J10 (2006–2013)","J11 (2013–2021)","J12 (2021–н.в.)"],
    "X-Trail":  ["T30 (2000–2007)","T31 (2007–2013)","T32 (2014–н.в.)"],
    "Tiida":    ["C11 (2004–2012)","C13 (2011–2018)"],
    "Almera":   ["N16 (2000–2006)","G11 (2012–н.в.)"],
    "Murano":   ["Z50 (2002–2008)","Z51 (2008–2016)","Z52 (2015–н.в.)"],
    "Patrol":   ["Y60 (1987–1997)","Y61 (1997–2010)","Y62 (2010–н.в.)"],
  },
  "Mazda": {
    "Mazda 6": ["GG (2002–2007)","GH (2007–2012)","GJ (2012–н.в.)"],
    "Mazda 3": ["BK (2003–2009)","BL (2009–2013)","BM (2013–2019)","BP (2019–н.в.)"],
    "CX-5":    ["KE (2011–2017)","KF (2017–н.в.)"],
    "CX-7":    ["ER (2006–2012)"],
    "Mazda 2": ["DY (2002–2007)","DE (2007–2014)","DJ (2014–н.в.)"],
    "CX-9":    ["TB (2006–2015)","TC (2016–н.в.)"],
  },
  "Subaru": {
    "Outback":  ["I (1994–1999)","II (1999–2003)","III (2003–2009)","IV (2009–2014)","V (2014–2019)","VI (2019–н.в.)"],
    "Forester": ["I (1997–2002)","II (2002–2007)","III (2007–2012)","IV (2012–2018)","V (2018–н.в.)"],
    "Impreza":  ["I (1992–2000)","II (2000–2007)","III (2007–2011)","IV (2011–2016)","V (2016–н.в.)"],
    "Legacy":   ["I (1989–1994)","II (1994–1999)","III (1999–2003)","IV (2003–2009)","V (2009–2014)","VI (2014–н.в.)"],
  },
  "Mitsubishi": {
    "Outlander":  ["I (2001–2006)","II (2006–2012)","III (2012–2021)","IV (2021–н.в.)"],
    "Lancer":     ["VII (1992–1995)","VIII (1995–2003)","IX (2003–2006)","X (2007–2017)"],
    "Pajero":     ["I (1982–1991)","II (1991–1999)","III (1999–2006)","IV (2006–2021)"],
    "ASX":        ["I (2010–2019)","II (2019–н.в.)"],
  },
  "Lexus": {
    "RX": ["I (1997–2003)","II (2003–2009)","III (2009–2015)","IV (2015–2022)","V (2022–н.в.)"],
    "ES": ["IV (1996–2001)","V (2001–2006)","VI (2006–2012)","VII (2012–2018)","VIII (2018–н.в.)"],
    "LX": ["I (1996–1997)","II (1998–2007)","III (2007–2021)","IV (2021–н.в.)"],
    "IS": ["I (1998–2005)","II (2005–2013)","III (2013–н.в.)"],
  },
  "Mercedes-Benz": {
    "C-Class":  ["W202 (1993–2000)","W203 (2000–2007)","W204 (2007–2014)","W205 (2014–н.в.)"],
    "E-Class":  ["W210 (1995–2003)","W211 (2002–2009)","W212 (2009–2016)","W213 (2016–н.в.)"],
    "S-Class":  ["W220 (1998–2005)","W221 (2005–2013)","W222 (2013–2020)","W223 (2020–н.в.)"],
    "GLC":      ["X253 (2015–2022)","X254 (2022–н.в.)"],
    "GLE":      ["W166 (2015–2018)","W167 (2018–н.в.)"],
    "A-Class":  ["W168 (1997–2004)","W169 (2004–2012)","W176 (2012–2018)","W177 (2018–н.в.)"],
    "GLS":      ["X164 (2006–2012)","X166 (2012–2019)","X167 (2019–н.в.)"],
    "Sprinter": ["W901-905 (1995–2006)","W906 (2006–2018)","W907 (2018–н.в.)"],
  },
  "BMW": {
    "3 Series": ["E36 (1990–2000)","E46 (1998–2006)","E90 (2005–2011)","F30 (2011–2019)","G20 (2018–н.в.)"],
    "5 Series": ["E39 (1995–2003)","E60 (2003–2010)","F10 (2010–2016)","G30 (2016–н.в.)"],
    "7 Series": ["E38 (1994–2001)","E65 (2001–2008)","F01 (2008–2015)","G11 (2015–н.в.)"],
    "X3":       ["E83 (2003–2010)","F25 (2010–2017)","G01 (2017–н.в.)"],
    "X5":       ["E53 (1999–2006)","E70 (2006–2013)","F15 (2013–2018)","G05 (2018–н.в.)"],
    "X6":       ["E71 (2008–2014)","F16 (2014–2019)","G06 (2019–н.в.)"],
    "1 Series": ["E87 (2004–2011)","F20 (2011–2019)","F40 (2019–н.в.)"],
  },
  "Volkswagen": {
    "Passat":  ["B5 (1996–2005)","B6 (2005–2010)","B7 (2010–2015)","B8 (2015–н.в.)"],
    "Golf":    ["IV (1997–2003)","V (2003–2008)","VI (2008–2012)","VII (2012–2019)","VIII (2019–н.в.)"],
    "Tiguan":  ["I (2007–2016)","II (2016–н.в.)"],
    "Polo":    ["IV (2001–2009)","V (2009–2017)","VI (2017–н.в.)"],
    "Touareg": ["I (2002–2010)","II (2010–2018)","III (2018–н.в.)"],
    "Jetta":   ["IV (1999–2005)","V (2005–2010)","VI (2010–2018)","VII (2018–н.в.)"],
    "Transporter": ["T4 (1990–2003)","T5 (2003–2015)","T6 (2015–н.в.)"],
  },
  "Audi": {
    "A4": ["B5 (1994–2001)","B6 (2000–2004)","B7 (2004–2008)","B8 (2007–2015)","B9 (2015–н.в.)"],
    "A6": ["C5 (1997–2004)","C6 (2004–2011)","C7 (2011–2018)","C8 (2018–н.в.)"],
    "Q5": ["8R (2008–2017)","FY (2017–н.в.)"],
    "Q7": ["4L (2005–2015)","4M (2015–н.в.)"],
    "A3": ["8L (1996–2003)","8P (2003–2012)","8V (2012–2020)","8Y (2020–н.в.)"],
    "Q3": ["8U (2011–2018)","F3 (2018–н.в.)"],
    "A8": ["D2 (1994–2002)","D3 (2002–2009)","D4 (2009–2017)","D5 (2017–н.в.)"],
  },
  "Opel": {
    "Astra":   ["F (1991–1998)","G (1998–2004)","H (2004–2009)","J (2009–2015)","K (2015–2021)"],
    "Vectra":  ["A (1988–1995)","B (1995–2002)","C (2002–2008)"],
    "Insignia":["I (2008–2017)","II (2017–н.в.)"],
    "Mokka":   ["I (2012–2016)","X (2016–2020)","II (2020–н.в.)"],
    "Zafira":  ["A (1999–2005)","B (2005–2011)","C (2011–2019)"],
    "Corsa":   ["B (1993–2000)","C (2000–2006)","D (2006–2014)","E (2014–2019)","F (2019–н.в.)"],
  },
  "Porsche": {
    "Cayenne": ["I (2002–2010)","II (2010–2017)","III (2017–н.в.)"],
    "Macan":   ["I (2014–2018)","II (2018–н.в.)"],
    "Panamera":["I (2009–2016)","II (2016–н.в.)"],
    "911":     ["996 (1997–2004)","997 (2004–2012)","991 (2011–2019)","992 (2018–н.в.)"],
  },
  "Hyundai": {
    "Tucson":  ["JM (2004–2010)","LM (2010–2015)","TL (2015–2021)","NX4 (2021–н.в.)"],
    "Sonata":  ["EF (1998–2004)","NF (2004–2010)","YF (2010–2014)","LF (2014–2017)","DN8 (2019–н.в.)"],
    "Santa Fe":["SM (2000–2006)","CM (2006–2012)","DM (2012–2018)","TM (2018–н.в.)"],
    "Creta":   ["GS (2015–2021)","SU2 (2021–н.в.)"],
    "Elantra": ["XD (2000–2006)","HD (2006–2010)","MD (2010–2016)","AD (2015–2020)","CN7 (2020–н.в.)"],
    "ix35":    ["I (2009–2015)","II (2017–н.в.)"],
  },
  "Kia": {
    "Sportage": ["JA (1993–2004)","KM (2004–2010)","SL (2010–2016)","QL (2016–2021)","NQ5 (2021–н.в.)"],
    "Cerato":   ["LD (2003–2008)","TD (2008–2013)","YD (2013–2018)","BD (2018–н.в.)"],
    "Sorento":  ["BL (2002–2009)","XM (2009–2014)","UM (2014–2020)","MQ4 (2020–н.в.)"],
    "Rio":      ["JB (2005–2011)","UB (2011–2017)","FB (2017–н.в.)"],
    "Optima":   ["TF (2010–2015)","JF (2015–2020)","DL3 (2020–н.в.)"],
    "Stinger":  ["CK (2017–н.в.)"],
  },
  "Ford": {
    "Focus":   ["I (1998–2005)","II (2004–2011)","III (2011–2018)","IV (2018–н.в.)"],
    "Mondeo":  ["II (1996–2000)","III (2000–2007)","IV (2007–2014)","V (2014–н.в.)"],
    "Explorer":["IV (2005–2010)","V (2010–2019)","VI (2019–н.в.)"],
    "Kuga":    ["I (2008–2012)","II (2012–2019)","III (2019–н.в.)"],
    "F-150":   ["XI (1997–2004)","XII (2004–2008)","XIII (2009–2014)","XIV (2015–2020)","XV (2021–н.в.)"],
    "Mustang": ["IV (1994–2004)","V (2005–2014)","VI (2015–2023)","VII (2023–н.в.)"],
  },
  "Chevrolet": {
    "Cruze":   ["I (2008–2016)","II (2016–2019)"],
    "Camaro":  ["IV (1993–2002)","V (2009–2015)","VI (2015–2023)"],
    "Tahoe":   ["I (1995–1999)","II (2000–2006)","III (2007–2014)","IV (2015–2020)","V (2020–н.в.)"],
    "Suburban":["VIII (1992–1999)","IX (2000–2006)","X (2007–2014)","XI (2015–2020)","XII (2021–н.в.)"],
    "Silverado":["I (1999–2006)","II (2007–2013)","III (2014–2018)","IV (2019–н.в.)"],
  },
  "Jeep": {
    "Grand Cherokee":["WJ (1999–2004)","WK (2005–2010)","WK2 (2011–2021)","WL (2021–н.в.)"],
    "Wrangler":      ["YJ (1986–1995)","TJ (1996–2006)","JK (2007–2018)","JL (2018–н.в.)"],
    "Cherokee":      ["XJ (1984–2001)","KJ (2002–2007)","KK (2008–2013)","KL (2014–н.в.)"],
    "Compass":       ["MK (2006–2017)","MP (2017–н.в.)"],
  },
  "Skoda": {
    "Octavia": ["A4 (1996–2010)","A5 (2004–2013)","A7 (2013–2020)","A8 (2020–н.в.)"],
    "Superb":  ["B5 (2001–2008)","B6 (2008–2015)","B8 (2015–н.в.)"],
    "Kodiaq":  ["NS (2016–н.в.)"],
    "Karoq":   ["NU (2017–н.в.)"],
    "Fabia":   ["6Y (1999–2007)","5J (2007–2014)","NJ (2014–2021)","PJ (2021–н.в.)"],
    "Rapid":   ["NH (2012–2019)","I (2019–н.в.)"],
  },
  "Renault": {
    "Logan":   ["I (2004–2012)","II (2012–2022)"],
    "Duster":  ["I (2010–2017)","II (2017–н.в.)"],
    "Megane":  ["II (2002–2009)","III (2008–2016)","IV (2015–н.в.)"],
    "Sandero": ["I (2007–2012)","II (2012–2020)","III (2020–н.в.)"],
    "Koleos":  ["I (2008–2016)","II (2016–н.в.)"],
    "Kaptur":  ["I (2016–н.в.)"],
    "Arkana":  ["I (2019–н.в.)"],
  },
  "Peugeot": {
    "207":  ["I (2006–2012)"],
    "208":  ["I (2012–2019)","II (2019–н.в.)"],
    "301":  ["I (2012–н.в.)"],
    "307":  ["I (2001–2008)"],
    "308":  ["I (2007–2013)","II (2013–2021)","III (2021–н.в.)"],
    "3008": ["I (2008–2016)","II (2016–н.в.)"],
    "408":  ["I (2010–2014)","II (2022–н.в.)"],
    "508":  ["I (2010–2018)","II (2018–н.в.)"],
  },
  "Citroën": {
    "C3":       ["I (2002–2009)","II (2009–2016)","III (2016–н.в.)"],
    "C4":       ["I (2004–2010)","II (2010–2018)","III (2020–н.в.)"],
    "C5":       ["I (2001–2008)","II (2007–2017)"],
    "Berlingo": ["I (1996–2008)","II (2008–2018)","III (2018–н.в.)"],
    "Jumper":   ["I (1994–2002)","II (2002–2006)","III (2006–н.в.)"],
  },
  "Volvo": {
    "XC90":  ["I (2002–2014)","II (2014–н.в.)"],
    "XC60":  ["I (2008–2017)","II (2017–н.в.)"],
    "XC40":  ["I (2017–н.в.)"],
    "S60":   ["I (2000–2009)","II (2010–2018)","III (2018–н.в.)"],
    "S80":   ["I (1998–2006)","II (2006–2016)"],
    "V90":   ["II (2016–н.в.)"],
  },
  "Land Rover": {
    "Discovery":   ["I (1989–1998)","II (1998–2004)","III (2004–2009)","IV (2009–2016)","V (2016–н.в.)"],
    "Range Rover": ["I (1970–1996)","II (1994–2002)","III (2002–2012)","IV (2012–2021)","V (2021–н.в.)"],
    "Freelander":  ["I (1997–2006)","II (2006–2014)"],
    "Defender":    ["I (1983–2016)","II (2020–н.в.)"],
    "Range Rover Sport": ["I (2005–2013)","II (2013–2022)","III (2022–н.в.)"],
  },
  "Jaguar": {
    "XF": ["I (2007–2015)","II (2015–н.в.)"],
    "XE": ["I (2015–н.в.)"],
    "XJ": ["X350 (2003–2009)","X351 (2009–2019)"],
    "F-Pace": ["I (2016–н.в.)"],
    "E-Pace": ["I (2017–н.в.)"],
  },
  "ВАЗ (Lada)": {
    "Vesta":   ["I (2015–н.в.)"],
    "Granta":  ["2190 (2011–н.в.)"],
    "XRAY":    ["I (2015–н.в.)"],
    "Largus":  ["I (2012–н.в.)"],
    "Niva":    ["2121 (1977–н.в.)","Niva Travel (2020–н.в.)"],
    "Priora":  ["2170 (2007–2018)"],
    "Kalina":  ["I (2004–2013)","II (2013–2018)"],
  },
  "УАЗ": {
    "Patriot":  ["I (2005–н.в.)"],
    "Hunter":   ["31519 (2003–н.в.)"],
    "452 (Буханка)": ["452 (1965–н.в.)"],
  },
  "ГАЗ (Волга)": {
    "Газель":     ["Next (2013–н.в.)","Бизнес (2010–н.в.)","3302 (1994–2010)"],
    "Соболь":     ["2310 (1998–н.в.)"],
    "Волга":      ["31105 (2004–2009)","3110 (1997–2004)"],
  },
  "Москвич": {
    "3 (Москвич)": ["I (2022–н.в.)"],
    "412":         ["I (1967–1998)"],
    "2141":        ["I (1986–2003)"],
  },
  "BYD": {
    "Han":   ["I (2020–н.в.)"],
    "Tang":  ["I (2015–2018)","II (2018–н.в.)"],
    "Song":  ["I (2015–2019)","Plus (2020–н.в.)"],
    "Seal":  ["I (2022–н.в.)"],
    "Atto 3":["I (2021–н.в.)"],
  },
  "Geely": {
    "Atlas":    ["I (2016–н.в.)"],
    "Coolray":  ["I (2018–н.в.)"],
    "Tugella":  ["I (2019–н.в.)"],
    "Emgrand":  ["I (2009–2016)","II (2016–н.в.)"],
  },
  "Haval": {
    "H6":   ["I (2011–2017)","II (2017–2020)","III (2020–н.в.)"],
    "F7":   ["I (2018–н.в.)"],
    "Jolion":["I (2021–н.в.)"],
    "H9":   ["I (2014–н.в.)"],
  },
  "Chery": {
    "Tiggo 7":  ["Pro (2020–н.в.)"],
    "Tiggo 8":  ["Pro (2021–н.в.)"],
    "Tiggo 4":  ["I (2017–н.в.)"],
    "Arrizo 5": ["I (2015–н.в.)"],
  },
};

// Все марки: объединяем из групп для select
const ALL_MAKES_FLAT = Object.values(MAKES_BY_COUNTRY).flat();
const MAKES = ALL_MAKES_FLAT;

interface FormData {
  name: string;
  phone: string;
  make: string;
  model: string;
  generation: string;
  part_desc: string;
  comment: string;
}

const EMPTY_FORM: FormData = { name: "", phone: "", make: "", model: "", generation: "", part_desc: "", comment: "" };

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const nav = (p: Page) => { setPage(p); setMobileMenu(false); window.scrollTo(0, 0); };

  const navLabels: Record<Page, string> = { home: "Главная", request: "Найти запчасть", contacts: "Контакты", privacy: "Политика конфиденциальности" };

  const models = form.make ? Object.keys(CAR_DB[form.make] || {}).sort() : [];
  const generations = form.make && form.model ? (CAR_DB[form.make]?.[form.model] || []) : [];

  const setField = (field: keyof FormData, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === "make") { next.model = ""; next.generation = ""; }
      if (field === "model") { next.generation = ""; }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Укажите имя и телефон");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm(EMPTY_FORM);
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка отправки");
      }
    } catch {
      setError("Нет соединения. Позвоните нам напрямую.");
    }
    setSending(false);
  };

  const selectStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    color: "white",
    background: "var(--metal-light)",
    border: "1px solid var(--metal-shine)",
    outline: "none",
    fontFamily: "Roboto, sans-serif",
    fontSize: "0.9rem",
    appearance: "none" as const,
  };

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
                <div className="text-white font-bold text-sm" style={{ fontFamily: "Oswald", textTransform: "uppercase", letterSpacing: "0.15em" }}>МеталлЧасть</div>
                <div className="text-xs" style={{ color: "var(--steel-gray)", fontFamily: "Roboto" }}>Разборка автомобилей</div>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-8">
              {(["home", "request", "contacts"] as Page[]).map(p => (
                <button key={p} onClick={() => nav(p)} className={`nav-link ${page === p ? "active" : ""}`}>{navLabels[p]}</button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Icon name="Phone" size={14} style={{ color: "var(--rust-red)" }} />
              <a href="tel:+79057108890" className="text-sm font-medium" style={{ color: "var(--chrome)", fontFamily: "Oswald", letterSpacing: "0.05em" }}>
                +7 (905) 710-88-90
              </a>
            </div>

            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              <Icon name={mobileMenu ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div style={{ background: "var(--metal-mid)", borderTop: "1px solid var(--metal-shine)" }} className="md:hidden px-4 py-4 flex flex-col gap-4">
            {(["home", "request", "contacts"] as Page[]).map(p => (
              <button key={p} onClick={() => nav(p)} className={`nav-link text-left ${page === p ? "active" : ""}`}>{navLabels[p]}</button>
            ))}
            <a href="tel:+79057108890" className="text-sm font-semibold" style={{ color: "var(--rust-orange)", fontFamily: "Oswald" }}>+7 (905) 710-88-90</a>
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
                  Оставьте заявку — менеджер перезвонит, уточнит наличие и подберёт нужную деталь. Разборка легковых и коммерческих авто. Гарантия 30 дней.
                </p>

                <div className="fade-in-delay-3 flex flex-wrap gap-4">
                  <button className="btn-primary" onClick={() => nav("request")}>Найти запчасть</button>
                  <button className="btn-secondary" onClick={() => nav("contacts")}>Позвонить нам</button>
                </div>
              </div>

              <div className="fade-in-delay-4 mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4" style={{ border: "1px solid var(--metal-shine)", maxWidth: 640 }}>
                {[
                  { n: "5 000+", l: "Запчастей" },
                  { n: "200+", l: "Авто разобрано" },
                  { n: "15 лет", l: "На рынке" },
                  { n: "30 дней", l: "Гарантия" },
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

          {/* How it works */}
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
            <h2 className="section-title text-3xl sm:text-4xl font-bold text-white mb-12">Как это работает</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "01", icon: "ClipboardList", title: "Заполните заявку", desc: "Укажите марку, модель, поколение автомобиля и название нужной запчасти", link: true },
                { step: "02", icon: "Phone", title: "Менеджер перезвонит", desc: "В течение 30 минут уточним наличие, цену и состояние детали", link: false },
                { step: "03", icon: "PackageCheck", title: "Получите деталь", desc: "Самовывоз или доставка транспортной компанией в любой регион России", link: false },
              ].map((item, i) => (
                <div
                  key={i}
                  className="part-card p-7 relative"
                  onClick={item.link ? () => nav("request") : undefined}
                  style={{ cursor: item.link ? "pointer" : "default" }}
                >
                  <div className="absolute top-5 right-5 text-5xl font-bold" style={{ color: "rgba(192,57,43,0.12)", fontFamily: "Oswald" }}>{item.step}</div>
                  <div className="w-12 h-12 flex items-center justify-center mb-5" style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)" }}>
                    <Icon name={item.icon} size={22} style={{ color: "var(--rust-red)" }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "Oswald", color: item.link ? "var(--rust-orange)" : "white" }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--steel-gray)", fontFamily: "Roboto", fontWeight: 300 }}>{item.desc}</p>
                  {item.link && (
                    <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: "var(--rust-red)", fontFamily: "Oswald", letterSpacing: "0.1em" }}>
                      ПЕРЕЙТИ К ФОРМЕ <Icon name="ArrowRight" size={12} />
                    </div>
                  )}
                </div>
              ))}
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

          {/* CTA */}
          <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0">
              <img src={PARTS_BG} alt="запчасти" className="w-full h-full object-cover" style={{ opacity: 0.18 }} />
              <div className="absolute inset-0" style={{ background: "rgba(8,8,8,0.85)" }} />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6" style={{ fontFamily: "Oswald" }}>
                НУЖНА<br /><span style={{ color: "var(--rust-red)" }}>ЗАПЧАСТЬ?</span>
              </h2>
              <p className="mb-8 text-base leading-relaxed" style={{ color: "var(--chrome)", fontFamily: "Roboto", fontWeight: 300 }}>
                Оставьте заявку — перезвоним за 30 минут и уточним наличие
              </p>
              <button className="btn-primary text-base px-10 py-4" onClick={() => nav("request")}>Оставить заявку</button>
            </div>
          </section>
        </div>
      )}

      {/* ─── REQUEST FORM ─── */}
      {page === "request" && (
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
          <div className="mb-10">
            <h1 className="section-title text-3xl sm:text-4xl font-bold text-white mb-2">Найти запчасть</h1>
            <p className="text-sm" style={{ color: "var(--steel-gray)" }}>
              Заполните форму — менеджер перезвонит и уточнит наличие
            </p>
          </div>

          {sent ? (
            <div className="text-center py-16 px-6" style={{ background: "var(--metal-mid)", border: "1px solid rgba(39,174,96,0.4)" }}>
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(39,174,96,0.12)", border: "1px solid rgba(39,174,96,0.3)" }}>
                <Icon name="CheckCircle" size={32} style={{ color: "#27ae60" }} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "Oswald" }}>Заявка отправлена!</h2>
              <p className="mb-8" style={{ color: "var(--steel-gray)" }}>Менеджер перезвонит вам в течение 30 минут</p>
              <button className="btn-primary" onClick={() => setSent(false)}>Отправить ещё одну</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: "var(--metal-mid)", border: "1px solid var(--metal-shine)" }} className="p-6 sm:p-8">

              {/* Блок авто */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid var(--metal-shine)" }}>
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: "var(--rust-red)" }}>
                    <Icon name="Car" size={14} className="text-white" />
                  </div>
                  <span className="font-bold text-white" style={{ fontFamily: "Oswald", letterSpacing: "0.1em" }}>АВТОМОБИЛЬ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Марка */}
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>МАРКА *</label>
                    <div className="relative">
                      <select
                        style={selectStyle}
                        value={form.make}
                        onChange={e => setField("make", e.target.value)}
                      >
                        <option value="" style={{ background: "#242424" }}>Выберите марку</option>
                        {Object.entries(MAKES_BY_COUNTRY).map(([country, brands]) => (
                          <optgroup key={country} label={country} style={{ background: "#1a1a1a", color: "#e67e22" }}>
                            {brands.map(m => <option key={m} value={m} style={{ background: "#242424", color: "white" }}>{m}</option>)}
                          </optgroup>
                        ))}
                      </select>
                      <Icon name="ChevronDown" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--steel-gray)" }} />
                    </div>
                  </div>

                  {/* Модель */}
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>МОДЕЛЬ</label>
                    <div className="relative">
                      <select
                        style={{ ...selectStyle, opacity: form.make ? 1 : 0.4 }}
                        value={form.model}
                        onChange={e => setField("model", e.target.value)}
                        disabled={!form.make}
                      >
                        <option value="" style={{ background: "#242424" }}>{models.length ? "Выберите модель" : "Укажите в поле «Запчасть»"}</option>
                        {models.map(m => <option key={m} value={m} style={{ background: "#242424" }}>{m}</option>)}
                      </select>
                      <Icon name="ChevronDown" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--steel-gray)" }} />
                    </div>
                  </div>

                  {/* Поколение */}
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>ПОКОЛЕНИЕ</label>
                    <div className="relative">
                      <select
                        style={{ ...selectStyle, opacity: form.model ? 1 : 0.4 }}
                        value={form.generation}
                        onChange={e => setField("generation", e.target.value)}
                        disabled={!form.model}
                      >
                        <option value="" style={{ background: "#242424" }}>Выберите поколение</option>
                        {generations.map(g => <option key={g} value={g} style={{ background: "#242424" }}>{g}</option>)}
                      </select>
                      <Icon name="ChevronDown" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--steel-gray)" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Блок запчасть */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid var(--metal-shine)" }}>
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: "var(--rust-red)" }}>
                    <Icon name="Wrench" size={14} className="text-white" />
                  </div>
                  <span className="font-bold text-white" style={{ fontFamily: "Oswald", letterSpacing: "0.1em" }}>ЗАПЧАСТЬ</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>НАЗВАНИЕ ЗАПЧАСТИ *</label>
                    <input
                      className="search-input"
                      placeholder="Например: передний бампер, двигатель 2.0, фара правая..."
                      value={form.part_desc}
                      onChange={e => setField("part_desc", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>КОММЕНТАРИЙ</label>
                    <textarea
                      className="search-input"
                      rows={3}
                      style={{ resize: "vertical" }}
                      placeholder="Дополнительная информация: цвет кузова, VIN, срочность..."
                      value={form.comment}
                      onChange={e => setField("comment", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Блок контакты */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid var(--metal-shine)" }}>
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: "var(--rust-red)" }}>
                    <Icon name="User" size={14} className="text-white" />
                  </div>
                  <span className="font-bold text-white" style={{ fontFamily: "Oswald", letterSpacing: "0.1em" }}>КОНТАКТНЫЕ ДАННЫЕ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>ИМЯ *</label>
                    <input className="search-input" placeholder="Ваше имя" value={form.name} onChange={e => setField("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>ТЕЛЕФОН *</label>
                    <input className="search-input" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={e => setField("phone", e.target.value)} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 text-sm" style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.4)", color: "var(--rust-red)", fontFamily: "Roboto" }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full text-center py-4 text-base" disabled={sending} style={{ opacity: sending ? 0.7 : 1 }}>
                {sending ? "Отправляем..." : "Отправить заявку — перезвоним за 30 минут"}
              </button>

              <p className="text-center text-xs mt-4" style={{ color: "var(--steel-gray)" }}>
                Нажимая кнопку, вы соглашаетесь на{" "}
                <button onClick={() => nav("privacy")} className="underline hover:text-white transition-colors" style={{ color: "var(--rust-orange)" }}>
                  обработку персональных данных
                </button>
              </p>
            </form>
          )}
        </div>
      )}

      {/* ─── CONTACTS ─── */}
      {page === "contacts" && (
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
          <div className="mb-10">
            <h1 className="section-title text-3xl sm:text-4xl font-bold text-white mb-2">Контакты</h1>
            <p className="text-sm" style={{ color: "var(--steel-gray)" }}>Приезжайте или свяжитесь удобным способом</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                { icon: "Phone", label: "Телефон", value: "+7 (905) 710-88-90", sub: "Пн–Вс 8:00–20:00" },
                { icon: "MessageCircle", label: "Max", value: "+7 (905) 710-88-90", sub: "Ответ в течение 15 минут" },
                { icon: "MapPin", label: "Адрес", value: "Московская обл., Кубинка, Наро-Фоминское ш., д. 4", sub: "Пн–Сб 8:00–20:00 • Вс 9:00–17:00" },
                { icon: "Mail", label: "Email", value: "pruddzen@gmail.com", sub: "Для юридических лиц и опта" },
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

              <div className="flex flex-col items-center justify-center gap-3" style={{ height: 200, background: "var(--metal-mid)", border: "1px solid var(--metal-shine)", position: "relative", overflow: "hidden" }}>
                <div className="absolute inset-0 hero-grid opacity-30" />
                <Icon name="MapPin" size={36} style={{ color: "var(--rust-red)", position: "relative" }} />
                <div className="relative text-white font-semibold text-sm" style={{ fontFamily: "Oswald" }}>Московская обл., Кубинка, Наро-Фоминское ш., д. 4</div>
                <div className="relative text-xs" style={{ color: "var(--steel-gray)" }}>Карта подключается по запросу</div>
              </div>
            </div>

            <div className="p-7 flex flex-col" style={{ background: "var(--metal-mid)", border: "1px solid var(--metal-shine)" }}>
              <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "Oswald" }}>Быстрая заявка</h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--steel-gray)" }}>
                Для подбора запчасти воспользуйтесь полной формой — там можно указать марку, модель и поколение автомобиля.
              </p>
              <button className="btn-primary w-full text-center mb-4" onClick={() => nav("request")}>
                Открыть форму заявки
              </button>
              <div className="text-center mt-auto">
                <p className="text-xs mb-3" style={{ color: "var(--steel-gray)" }}>или позвоните сразу</p>
                <a href="tel:+79057108890" className="text-2xl font-bold" style={{ fontFamily: "Oswald", color: "var(--rust-orange)", letterSpacing: "0.05em" }}>
                  +7 (905) 710-88-90
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRIVACY ─── */}
      {page === "privacy" && (
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
          <button onClick={() => nav("home")} className="flex items-center gap-2 mb-8 text-sm hover:text-white transition-colors" style={{ color: "var(--steel-gray)", fontFamily: "Oswald" }}>
            <Icon name="ArrowLeft" size={16} /> НАЗАД
          </button>

          <h1 className="section-title text-3xl font-bold text-white mb-8">Политика конфиденциальности</h1>

          <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--chrome)", fontFamily: "Roboto", fontWeight: 300 }}>

            <p style={{ color: "var(--steel-gray)" }}>Дата вступления в силу: 1 января 2024 г.</p>

            {[
              {
                title: "1. Общие положения",
                text: "Настоящая Политика конфиденциальности описывает, как ИП МеталлЧасть (далее — «Оператор») собирает, использует и защищает персональные данные пользователей сайта. Используя сайт и оставляя заявку, вы соглашаетесь с условиями настоящей Политики.",
              },
              {
                title: "2. Какие данные мы собираем",
                text: "При заполнении формы обратной связи мы собираем: имя пользователя, номер телефона, информацию об автомобиле (марка, модель, поколение), наименование запрашиваемой запчасти, комментарий (если указан). Мы не собираем платёжные данные, паспортные данные или иную чувствительную информацию.",
              },
              {
                title: "3. Цели обработки данных",
                text: "Собранные данные используются исключительно для: обратного звонка менеджера с целью уточнения наличия запчасти, подбора необходимой детали и консультации по стоимости и срокам. Мы не используем ваши данные для рекламных рассылок без вашего отдельного согласия.",
              },
              {
                title: "4. Передача данных третьим лицам",
                text: "Оператор не передаёт персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством Российской Федерации. Данные не продаются и не используются в коммерческих целях.",
              },
              {
                title: "5. Хранение и защита данных",
                text: "Персональные данные хранятся на защищённых серверах и передаются по зашифрованному каналу (HTTPS). Доступ к данным имеют только уполномоченные сотрудники. Срок хранения данных — не более 1 года с момента подачи заявки.",
              },
              {
                title: "6. Права пользователя",
                text: "Вы вправе в любой момент запросить информацию о хранящихся данных, потребовать их изменения или удаления. Для этого свяжитесь с нами по email или телефону, указанным в разделе «Контакты».",
              },
              {
                title: "7. Cookies",
                text: "Сайт может использовать cookie-файлы для анализа посещаемости и улучшения работы сервиса. Cookie не содержат персональных данных. Вы можете отключить cookies в настройках браузера.",
              },
              {
                title: "8. Изменения политики",
                text: "Оператор вправе вносить изменения в настоящую Политику. Актуальная версия всегда доступна на данной странице сайта. Продолжение использования сайта после изменений означает ваше согласие с новой редакцией.",
              },
              {
                title: "9. Контакты",
                text: "По всем вопросам, связанным с обработкой персональных данных, обращайтесь: телефон +7 (905) 710-88-90, email pruddzen@gmail.com, адрес: Московская обл., Кубинка, Наро-Фоминское ш., д. 4.",
              },
            ].map((section, i) => (
              <div key={i} className="p-5" style={{ background: "var(--metal-mid)", border: "1px solid var(--metal-shine)" }}>
                <h3 className="font-bold text-white mb-3" style={{ fontFamily: "Oswald", fontSize: "1rem" }}>{section.title}</h3>
                <p>{section.text}</p>
              </div>
            ))}

            <div className="pt-4 text-center">
              <button className="btn-primary" onClick={() => nav("request")}>Вернуться к заявке</button>
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
                Авторазборка с 15-летним опытом. Качественные запчасти с гарантией. Перезваниваем за 30 минут.
              </p>
            </div>
            <div>
              <div className="text-xs tracking-widest mb-4" style={{ color: "var(--rust-red)", fontFamily: "Oswald" }}>РАЗДЕЛЫ</div>
              {(["home", "request", "contacts"] as Page[]).map(p => (
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
                <p className="mt-3 font-medium" style={{ color: "var(--chrome)" }}>+7 (905) 710-88-90</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--metal-shine)", paddingTop: "1.5rem" }} className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs" style={{ color: "var(--steel-gray)" }}>© 2024 МеталлЧасть. Все права защищены.</p>
            <button onClick={() => nav("privacy")} className="text-xs underline hover:text-white transition-colors" style={{ color: "var(--steel-gray)" }}>
              Политика конфиденциальности
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}