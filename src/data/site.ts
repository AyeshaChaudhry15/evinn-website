export const SITE = {
  name: "EVINN",
  tagline: "Electric Mobility Marketplace",
  phone: "+92 300 1234567",
  email: "evinnbwp@gmail.com",
  address: "Bahawalpur, Pakistan",
  social: {
    facebook: "https://facebook.com",
    instagram: "https://www.instagram.com/evinn_pakistan?rpxt=cHp5Z2N4MGdoZ3R4",
    linkedin: "https://linkedin.com",
    x: "https://x.com",
    youtube: "https://youtube.com",
  },
} as const;

export const telHref = `tel:${SITE.phone.replace(/\s/g, "")}`;
export const whatsappHref = `https://wa.me/${SITE.phone.replace(/\D/g, "")}`;
