export type AfricaCountry = {
  code: string;
  name: string;
  goafricaCode: string;
  lat: number;
  lng: number;
  cities: AfricaCity[];
};

export type AfricaCity = {
  name: string;
  slug: string;
  lat: number;
  lng: number;
};

export const COUNTRIES: AfricaCountry[] = [
  {
    code: "BEN", name: "Bénin", goafricaCode: "bj", lat: 9.3, lng: 2.3,
    cities: [
      { name: "Cotonou", slug: "cotonou", lat: 6.36, lng: 2.39 },
      { name: "Porto-Novo", slug: "porto-novo", lat: 6.50, lng: 2.60 },
      { name: "Parakou", slug: "parakou", lat: 9.34, lng: 2.63 },
      { name: "Abomey-Calavi", slug: "abomey-calavi", lat: 6.45, lng: 2.35 },
      { name: "Bohicon", slug: "bohicon", lat: 7.18, lng: 2.07 },
      { name: "Djougou", slug: "djougou", lat: 9.69, lng: 1.67 },
      { name: "Lokossa", slug: "lokossa", lat: 6.64, lng: 1.72 },
      { name: "Natitingou", slug: "natitingou", lat: 10.30, lng: 1.38 },
      { name: "Ouidah", slug: "ouidah", lat: 6.37, lng: 2.09 },
      { name: "Abomey", slug: "abomey", lat: 7.18, lng: 1.99 },
    ],
  },
  {
    code: "TGO", name: "Togo", goafricaCode: "tg", lat: 8.6, lng: 1.0,
    cities: [
      { name: "Lomé", slug: "lome", lat: 6.17, lng: 1.23 },
      { name: "Sokodé", slug: "sokode", lat: 8.98, lng: 1.13 },
      { name: "Kara", slug: "kara", lat: 9.55, lng: 1.19 },
      { name: "Atakpamé", slug: "atakpame", lat: 7.53, lng: 1.13 },
      { name: "Kpalimé", slug: "kpalime", lat: 6.90, lng: 0.63 },
    ],
  },
  {
    code: "CIV", name: "Côte d'Ivoire", goafricaCode: "ci", lat: 7.5, lng: -5.5,
    cities: [
      { name: "Abidjan", slug: "abidjan", lat: 5.36, lng: -4.01 },
      { name: "Bouaké", slug: "bouake", lat: 7.69, lng: -5.03 },
      { name: "Yamoussoukro", slug: "yamoussoukro", lat: 6.82, lng: -5.28 },
      { name: "San-Pédro", slug: "san-pedro", lat: 4.75, lng: -6.64 },
      { name: "Daloa", slug: "daloa", lat: 6.88, lng: -6.45 },
      { name: "Korhogo", slug: "korhogo", lat: 9.46, lng: -5.63 },
    ],
  },
  {
    code: "SEN", name: "Sénégal", goafricaCode: "sn", lat: 14.5, lng: -14.5,
    cities: [
      { name: "Dakar", slug: "dakar", lat: 14.69, lng: -17.44 },
      { name: "Saint-Louis", slug: "saint-louis", lat: 16.02, lng: -16.49 },
      { name: "Thiès", slug: "thies", lat: 14.79, lng: -16.93 },
      { name: "Ziguinchor", slug: "ziguinchor", lat: 12.56, lng: -16.27 },
      { name: "Mbour", slug: "mbour", lat: 14.42, lng: -16.97 },
    ],
  },
  {
    code: "CMR", name: "Cameroun", goafricaCode: "cm", lat: 6.0, lng: 12.0,
    cities: [
      { name: "Douala", slug: "douala", lat: 4.05, lng: 9.77 },
      { name: "Yaoundé", slug: "yaounde", lat: 3.87, lng: 11.52 },
      { name: "Bafoussam", slug: "bafoussam", lat: 5.47, lng: 10.42 },
      { name: "Garoua", slug: "garoua", lat: 9.30, lng: 13.39 },
      { name: "Bamenda", slug: "bamenda", lat: 5.96, lng: 10.15 },
    ],
  },
  {
    code: "BFA", name: "Burkina Faso", goafricaCode: "bf", lat: 12.4, lng: -1.5,
    cities: [
      { name: "Ouagadougou", slug: "ouagadougou", lat: 12.37, lng: -1.52 },
      { name: "Bobo-Dioulasso", slug: "bobo-dioulasso", lat: 11.18, lng: -4.29 },
      { name: "Koudougou", slug: "koudougou", lat: 12.25, lng: -2.36 },
    ],
  },
  {
    code: "MLI", name: "Mali", goafricaCode: "ml", lat: 17.0, lng: -4.0,
    cities: [
      { name: "Bamako", slug: "bamako", lat: 12.64, lng: -8.00 },
      { name: "Sikasso", slug: "sikasso", lat: 11.32, lng: -5.67 },
      { name: "Ségou", slug: "segou", lat: 13.43, lng: -5.67 },
    ],
  },
  {
    code: "NER", name: "Niger", goafricaCode: "ne", lat: 17.6, lng: 8.1,
    cities: [
      { name: "Niamey", slug: "niamey", lat: 13.51, lng: 2.13 },
      { name: "Zinder", slug: "zinder", lat: 13.81, lng: 8.99 },
      { name: "Maradi", slug: "maradi", lat: 13.50, lng: 7.10 },
    ],
  },
  {
    code: "GIN", name: "Guinée", goafricaCode: "gn", lat: 11.0, lng: -12.0,
    cities: [
      { name: "Conakry", slug: "conakry", lat: 9.64, lng: -13.58 },
      { name: "Kankan", slug: "kankan", lat: 10.39, lng: -9.31 },
    ],
  },
  {
    code: "GAB", name: "Gabon", goafricaCode: "ga", lat: -0.8, lng: 11.8,
    cities: [
      { name: "Libreville", slug: "libreville", lat: 0.39, lng: 9.45 },
      { name: "Port-Gentil", slug: "port-gentil", lat: -0.72, lng: 8.78 },
    ],
  },
  {
    code: "COG", name: "Congo", goafricaCode: "cg", lat: -1.0, lng: 15.3,
    cities: [
      { name: "Brazzaville", slug: "brazzaville", lat: -4.27, lng: 15.28 },
      { name: "Pointe-Noire", slug: "pointe-noire", lat: -4.77, lng: 11.87 },
    ],
  },
  {
    code: "COD", name: "RD Congo", goafricaCode: "cd", lat: -4.0, lng: 22.0,
    cities: [
      { name: "Kinshasa", slug: "kinshasa", lat: -4.32, lng: 15.31 },
      { name: "Lubumbashi", slug: "lubumbashi", lat: -11.66, lng: 27.47 },
    ],
  },
  {
    code: "MDG", name: "Madagascar", goafricaCode: "mg", lat: -18.9, lng: 47.5,
    cities: [
      { name: "Antananarivo", slug: "antananarivo", lat: -18.91, lng: 47.54 },
      { name: "Toamasina", slug: "toamasina", lat: -18.15, lng: 49.40 },
    ],
  },
  {
    code: "TCD", name: "Tchad", goafricaCode: "td", lat: 15.5, lng: 19.0,
    cities: [
      { name: "N'Djamena", slug: "ndjamena", lat: 12.11, lng: 15.04 },
    ],
  },
  {
    code: "MRT", name: "Mauritanie", goafricaCode: "mr", lat: 21.0, lng: -10.9,
    cities: [
      { name: "Nouakchott", slug: "nouakchott", lat: 18.09, lng: -15.98 },
    ],
  },
];

export const ALL_CITIES = COUNTRIES.flatMap((country) =>
  country.cities.map((city) => ({
    ...city,
    country: country.name,
    countryCode: country.code,
    goafricaCode: country.goafricaCode,
  }))
);

export const COVERED_COUNTRY_CODES = COUNTRIES.map((c) => c.code);
