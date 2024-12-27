import Link from "next/link";

export const Footer = () => {
  return (
    <footer className=" w-full min-h-16 bg-slate-900 dark:bg-sky-950 flex flex-col justify-center  items-center ">
      <p>Easylis - {new Date().getFullYear()} - Tous droits réservés</p>
      <p className="text-sm opacity-30 italic font-thin">
        <Link
          href="https://www.linkedin.com/in/aur%C3%A9lien-leroy-8304a9284/"
          target="_blank"
        >
          Création Leroy Aurélien
        </Link>
      </p>
    </footer>
  );
};
