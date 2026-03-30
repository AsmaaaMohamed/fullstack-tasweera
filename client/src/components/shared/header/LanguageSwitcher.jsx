"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import Link from "next/link";

export default function LanguageSwitcher({ onSelect }) {
  const languageLabels = {
    en: "EN",
    ar: "عربي",
  };
  const locale = useLocale();
  const pathname = usePathname();

  const buildHref = (targetLocale) => {
    const segments = pathname.split("/").slice(1).join("/");
    return `/${targetLocale}/${segments}`;
  };
  return (
    <ButtonGroup>
      <Button
        variant="ghost"
        className="flex items-center gap-1 !pr-0 py-2 hover:bg-transparent "
      >
        <Globe size={24} className="text-[#5C4008] dark:text-[#c79430] size-6" />
        <span className="leading-9 text-black dark:text-white font-normal text-base">
          {languageLabels[locale]}
        </span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            aria-label="More Options"
            className="focus-ring-0 hover:bg-transparent"
          >
            <svg
              className="size-2.5"
              width="10"
              height="5"
              viewBox="0 0 10 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0L5 5L10 0H0Z" fill="#c79430" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={buildHref("en")} onClick={onSelect}>EN</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={buildHref("ar")} onClick={onSelect}>عربي</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
