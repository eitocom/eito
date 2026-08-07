"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";

import { signOut } from "@/app/login/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type HeaderUser = {
  name: string | null;
  email: string;
  username: string | null;
  avatarUrl: string | null;
};

function displayName(user: HeaderUser) {
  return user.name || user.username || user.email;
}

function avatarInitial(user: HeaderUser) {
  const source = user.name || user.username || user.email;
  return source.charAt(0).toUpperCase();
}

export function UserMenu({ user }: { user: HeaderUser }) {
  const label = displayName(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-2 rounded-full px-1.5 py-1 sm:rounded-lg sm:pr-2.5"
          aria-label={`Menu da conta de ${label}`}
        >
          <Avatar size="sm">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback className="bg-[oklch(0.78_0.12_130/0.25)] font-semibold text-[oklch(0.45_0.1_145)]">
              {avatarInitial(user)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">
            {label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground truncate text-sm font-medium">
              {label}
            </span>
            {user.name || user.username ? (
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full cursor-pointer">
              <LogOut />
              Sair
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
