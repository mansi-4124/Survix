import { Link } from "react-router-dom";

type AuthFooterProps = {
  text: string;
  linkText: string;
  link: string;
};

export const AuthFooter = ({ text, linkText, link }: AuthFooterProps) => (
  <p className="text-center text-sm text-slate-600 mt-6">
    {text}{" "}
    <Link to={link} className="text-indigo-600 hover:text-indigo-700 font-medium">
      {linkText}
    </Link>
  </p>
);
