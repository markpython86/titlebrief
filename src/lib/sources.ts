export const OFFICIAL_SOURCES = {
  txdmvBuyingSelling: {
    href: "https://www.txdmv.gov/motorists/buying-or-selling-a-vehicle",
    label: "TxDMV: Buying or selling a vehicle",
  },
  comptrollerSpvGuide: {
    href: "https://comptroller.texas.gov/taxes/publications/96-254/spv.php",
    label: "Comptroller SPV guide (publication 96-254, revised March 2026)",
  },
  comptrollerPrivatePartySpv: {
    href: "https://comptroller.texas.gov/taxes/motor-vehicle/private-party-spv.php",
    label: "Comptroller: Private-party purchases and standard presumptive values",
  },
  comptrollerTaxRates: {
    href: "https://comptroller.texas.gov/taxes/publications/96-254/tax-rates.php",
    label: "Comptroller motor vehicle tax rates (publication 96-254)",
  },
  comptrollerMvst: {
    href: "https://comptroller.texas.gov/taxes/motor-vehicle/sales-use.php",
    label: "Comptroller: Motor vehicle sales and use tax",
  },
  form130U: {
    href: "https://www.txdmv.gov/sites/default/files/form_files/Form-130-U.pdf",
    label: "Application for Texas Title and/or Registration (Form 130-U)",
  },
  sellerVtn: {
    href: "https://www.txdmv.gov/VTN",
    label: "Seller Vehicle Transfer Notification",
  },
  sellerVtnOnline: {
    href: "https://webdealer.txdmv.gov/title/publicVehicleTransfer",
    label: "Online Vehicle Transfer Notification",
  },
  formVtr346: {
    href: "https://www.txdmv.gov/sites/default/files/form_files/VTR-346.pdf",
    label: "Texas Motor Vehicle Transfer Notification (Form VTR-346)",
  },
  form14128: {
    href: "https://comptroller.texas.gov/taxes/motor-vehicle/forms/",
    label: "Used Motor Vehicle Certified Appraisal (Form 14-128)",
  },
  spvCalculator: {
    href: "https://www.txdmv.gov/standard-presumptive-calculator",
    label: "Official SPV calculator",
  },
} as const;

export const SUPPORT_CONTACT = "support@titlebrief.local";

export const PACKET_PRICE_CENTS = 1900;

export const ACTIVE_RULE_ID = "tx-mvst-96-254-2026-03";

export const REQUIRED_ELIGIBILITY_COPY =
  "This is an ordinary Texas private-party purchase of a passenger vehicle. Titlebrief does not file a title and does not give tax advice.";

export const TAX_PREVIEW_LABEL = "Estimated tax preview. Not tax advice.";

export const APPRAISAL_COMPARE_COPY =
  "Estimated comparison. This is not a recommendation to obtain an appraisal.";

export const DEADLINE_COPY =
  "Texas requires title transfer within 30 days of purchase.";

export const SELLER_VTN_REMINDER =
  "A Vehicle Transfer Notification exists and should be completed by the seller. Titlebrief does not file it.";
