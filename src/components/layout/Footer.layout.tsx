import Link from "next/link";
import packageJson from "../../../package.json";

export const Footer = () => {
  return (
    <footer className=" w-full min-h-fit h-full bg-slate-900 dark:bg-sky-950 text-white  p-4 relative flex flex-col justify-center items-center ">
      <p>Easylis {new Date().getFullYear()} - Tous droits réservés</p>
      <p>
        <span className="text-xs opacity-10 absolute bottom-0 left-1">
          version: {packageJson.version}
        </span>
      </p>
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
