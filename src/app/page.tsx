import { signOut } from "@/app/login/actions";
import { PersistLastLogin } from "@/components/auth/persist-last-login";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col">
      <PersistLastLogin />
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <p className="font-heading text-xl font-semibold tracking-tight">
          Eito
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </header>

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-16">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Bem-vindo ao mutirão
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Você entrou como{" "}
          <span className="font-medium text-foreground">{user?.email}</span>.
          Em breve você poderá acompanhar projetos abertos, tarefas com bounty
          via PIX e contribuições verificadas por Pull Request.
        </p>
      </section>
    </main>
  );
}
