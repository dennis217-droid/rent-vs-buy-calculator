import type { AustralianState } from './calculator';

export interface StateLandingConfig {
  slug: string;
  state: AustralianState;
  name: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
}

export const STATE_LANDING_PAGES: StateLandingConfig[] = [
  {
    slug: 'nsw-stamp-duty-calculator',
    state: 'NSW',
    name: 'New South Wales',
    title: 'NSW Rent vs Buy Calculator | Live Stamp Duty & Mortgage Rates',
    description:
      'Compare renting vs buying in New South Wales with live NSW transfer duty rates sourced from Revenue NSW, the current RBA mortgage rate, and a full net wealth projection.',
    heading: 'Rent vs Buy Calculator for New South Wales',
    intro:
      "See whether buying or renting builds more net wealth in NSW. This calculator pulls the current NSW transfer duty (stamp duty) rate schedule live from Revenue NSW — thresholds are CPI-indexed and change every financial year, so the figure below reflects the current schedule rather than a stale estimate.",
  },
  {
    slug: 'vic-stamp-duty-calculator',
    state: 'VIC',
    name: 'Victoria',
    title: 'VIC Rent vs Buy Calculator | Live Stamp Duty & Mortgage Rates',
    description:
      'Compare renting vs buying in Victoria with live land transfer duty rates sourced from the State Revenue Office, the current RBA mortgage rate, and a full net wealth projection.',
    heading: 'Rent vs Buy Calculator for Victoria',
    intro:
      "See whether buying or renting builds more net wealth in Victoria. This calculator pulls the current Victorian land transfer duty rate schedule live from the State Revenue Office, including the flat-rate band that applies above $960,000.",
  },
  {
    slug: 'qld-stamp-duty-calculator',
    state: 'QLD',
    name: 'Queensland',
    title: 'QLD Rent vs Buy Calculator | Live Stamp Duty & Mortgage Rates',
    description:
      'Compare renting vs buying in Queensland with live transfer duty rates sourced from the Queensland Revenue Office, the current RBA mortgage rate, and a full net wealth projection.',
    heading: 'Rent vs Buy Calculator for Queensland',
    intro:
      'See whether buying or renting builds more net wealth in Queensland. This calculator pulls the current Queensland transfer duty rate schedule live from the Queensland Revenue Office.',
  },
  {
    slug: 'wa-stamp-duty-calculator',
    state: 'WA',
    name: 'Western Australia',
    title: 'WA Rent vs Buy Calculator | Live Stamp Duty & Mortgage Rates',
    description:
      'Compare renting vs buying in Western Australia with live transfer duty rates sourced from RevenueWA, the current RBA mortgage rate, and a full net wealth projection.',
    heading: 'Rent vs Buy Calculator for Western Australia',
    intro:
      "See whether buying or renting builds more net wealth in WA. This calculator pulls the current WA general transfer duty rate schedule live from the Department of Treasury and Finance.",
  },
  {
    slug: 'sa-stamp-duty-calculator',
    state: 'SA',
    name: 'South Australia',
    title: 'SA Rent vs Buy Calculator | Stamp Duty & Mortgage Rates',
    description:
      'Compare renting vs buying in South Australia with transfer duty rates, the current RBA mortgage rate, and a full net wealth projection.',
    heading: 'Rent vs Buy Calculator for South Australia',
    intro:
      "See whether buying or renting builds more net wealth in SA. RevenueSA's site blocks automated rate lookups, so this calculator uses a built-in indicative SA duty schedule rather than a live feed — always confirm the exact figure with RevenueSA.",
  },
  {
    slug: 'act-stamp-duty-calculator',
    state: 'ACT',
    name: 'the ACT',
    title: 'ACT Rent vs Buy Calculator | Live Conveyance Duty & Mortgage Rates',
    description:
      'Compare renting vs buying in the ACT with live conveyance duty rates sourced from the ACT Revenue Office, the current RBA mortgage rate, and a full net wealth projection.',
    heading: 'Rent vs Buy Calculator for the ACT',
    intro:
      "See whether buying or renting builds more net wealth in the ACT. This calculator pulls the current ACT owner-occupier conveyance duty rate schedule live from the ACT Revenue Office, which is updated in most annual territory budgets.",
  },
];
