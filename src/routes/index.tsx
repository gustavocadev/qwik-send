import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import {
  routeAction$,
  type DocumentHead,
  Form,
  zod$,
  z,
} from '@builder.io/qwik-city';
import * as argon2 from 'argon2';
import { Dropzone } from '~/components/Dropzone';
import { auth } from '~/lib/lucia';
import { prisma } from '~/lib/prisma';

export const useFileUploadAction = routeAction$(
  async (values, event) => {
    // data.file will contain the uploaded file
    const file_url = crypto.randomUUID();
    const filename = crypto.randomUUID();
    const original_filename = values.file.name;
    let filePassword = undefined;
    let fileDownloads = undefined;
    let authorId = undefined;
    console.log('Hello from server!');
    const authRequest = auth.handleRequest(event);
    const session = await authRequest.validate();
    const fileSize = session ? 100_000_00 : 1024 * 1024;

    /*
      Steps to upload file
      if user is not logged in
      1. Check if file is too large
      2. Generate a random file name
      3. Upload file
      4. Generate a URL for the file

      if user is logged in
      1. Check if user is logged in
      2. Check if file is too large
      3. Check if user wants to set a password
      4. Check if user wants to set a download limit
      5. Create a random file name
      6. Upload file
      7. Generate a URL for the file
    */

    if (values.file.size > fileSize) {
      return {
        success: false,
        error: 'File too large',
      };
    }
    // const blob = new Blob([values.file as File], { type: values.file.type });

    if (session) {
      if (values.password) {
        fileDownloads = values.downloads;
      }

      if (values.password) {
        const hashedPassword = await argon2.hash(values.password);

        filePassword = hashedPassword;
      }

      authorId = session.user.userId;
    }

    await prisma.link.create({
      data: {
        filename,
        original_filename,
        url: file_url,
        password: filePassword,
        downloads: fileDownloads,
        author_id: authorId,
      },
    });

    return {
      success: true,
      url: file_url,
    };
  },
  zod$({
    file: z.object({
      name: z.string(),
      type: z.string().optional().default('application/octet-stream'),
      size: z.number(),
    }),
    password: z.string().optional(),
    downloads: z.number().optional(),
  })
);

export default component$(() => {
  const fileUpload = useFileUploadAction();
  const formRef = useSignal<HTMLFormElement>();
  const draggableRef = useSignal<HTMLElement>();
  const inputFileRef = useSignal<HTMLInputElement>();

  useVisibleTask$(({ cleanup }) => {
    if (!draggableRef.value) return;

    const drop = (event: DragEvent) => {
      event.preventDefault();

      const files = event.dataTransfer?.files;
      if (!files) return;
      if (!inputFileRef.value?.files) return;

      inputFileRef.value.files = files;

      // execute the action
      formRef.value?.requestSubmit();
    };

    // Use the DOM API to add an event listener.
    draggableRef.value.addEventListener('drop', drop);

    // for styles
    draggableRef.value.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
    draggableRef.value.addEventListener('dragleave', () => {});

    cleanup(() => {
      draggableRef.value!.removeEventListener('drop', drop);
      draggableRef.value!.removeEventListener('dragover', () => {});
      draggableRef.value!.removeEventListener('dragleave', () => {});
    });
  });

  return (
    <>
      {!fileUpload.value?.success ? (
        <section class="bg-error">
          <p class="text-3xl text-center p-2">{fileUpload.value?.error}</p>
        </section>
      ) : null}
      <section class="flex flex-col p-4 sm:flex-row gap-4 max-w-5xl mx-auto my-14">
        <Form action={fileUpload} class="flex-1" ref={formRef}>
          <Dropzone draggableRef={draggableRef} inputFileRef={inputFileRef} />
        </Form>
        <section class="flex-1 gap-2 flex flex-col">
          <h2 class="text-4xl font-semibold">
            Compartir archivos de forma sencilla y privada
          </h2>
          <p>
            Qwik Send te permite compartir archivos con cifrado de extremo a
            extremo de ser descargado. Asi que puedes mantener lo que compartes
            en privado y asegurarte de que tus cosas no permanezcan en linea
            para siempre.
          </p>
          <p class="font-bold">Crea una cuenta para mayores beneficios</p>
        </section>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};
