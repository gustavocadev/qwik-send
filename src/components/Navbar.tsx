import { component$ } from '@builder.io/qwik';

export const Navbar = component$(() => {
  return (
    <nav class="flex flex-col sm:flex-row justify-between p-4 gap-4">
      <h2 class="text-4xl text-center">Qwik Send</h2>

      <section class="flex items-center justify-center">
        <button class="text-lg btn-ghost btn">Inicia sesion</button>
        <button class="text-lg btn-ghost btn">Crear cuenta</button>
      </section>
    </nav>
  );
});
