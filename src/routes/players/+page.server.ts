import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from "drizzle-orm";

export const load = (async () => {
  const players = await db.select().from(users).orderBy(users.id);
  return { players };
  // try {
  //     await db.update(users).set({ name: name.trim(), surname: surname.trim(), age: ageNum, country: country.trim() }).where(eq(users.id,id));
  //     return { success: true };
  //   } catch (error) {
  //     console.error('Błąd przy edycji użytkownika:', error);
  //     return fail(500, { message: 'Błąd przy edycji użytkownika' });
  //   }
}) satisfies PageServerLoad;

export const actions = {
  addUser: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() || '';
    const surname = formData.get('surname')?.toString() || '';
    const age = formData.get('age')?.toString() || '';
    const country = formData.get('country')?.toString() || '';

    // Walidacja
    if (!name.trim()) {
      return fail(400, { fieldError: 'name', message: 'Imię jest wymagane' });
    }
    if (!surname.trim()) {
      return fail(400, { fieldError: 'surname', message: 'Nazwisko jest wymagane' });
    }
    if (!age.trim()) {
      return fail(400, { fieldError: 'age', message: 'Wiek jest wymagany' });
    }
    if (!country.trim()) {
      return fail(400, { fieldError: 'country', message: 'Kraj jest wymagany' });
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      return fail(400, { fieldError: 'age', message: 'Wiek musi być liczbą od 1 do 150' });
    }

    try {
      await db.insert(users).values({
        name: name.trim(),
        surname: surname.trim(),
        age: ageNum,
        country: country.trim()
      });

      return { success: true, message: 'Użytkownik dodany pomyślnie!' };
    } catch (error) {
      console.error('Błąd przy dodawaniu użytkownika:', error);
      return fail(500, { message: 'Błąd przy dodawaniu użytkownika' });
    }
  },
  editUser: async ({ request }) => {
    const formData = await request.formData();
    const id = parseInt(formData.get('id')?.toString() || '');
    const name = formData.get('name')?.toString() || '';
    const surname = formData.get('surname')?.toString() || '';
    const age = formData.get('age')?.toString() || '';
    const country = formData.get('country')?.toString() || '';

    if (Number.isNaN(id)) return fail(400, { message: 'Nieprawidłowe id' });
    if (!name.trim() || !surname.trim() || !age.trim() || !country.trim()) {
      return fail(400, { message: 'Wszystkie pola są wymagane' });
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      return fail(400, { fieldError: 'age', message: 'Wiek musi być liczbą od 1 do 150' });
    }

    try {
      await db.update(users).set({ name: name.trim(), surname: surname.trim(), age: ageNum, country: country.trim() }).where(eq(users.id,id));
      return { success: true };
    } catch (error) {
      console.error('Błąd przy edycji użytkownika:', error);
      return fail(500, { message: 'Błąd przy edycji użytkownika' });
    }
  },
  deleteUser: async ({ request }) => {
    const formData = await request.formData();
    const id = parseInt(formData.get('id')?.toString() || '');
    if (Number.isNaN(id)) return fail(400, { message: 'Nieprawidłowe id' });

    try {
      await db.delete(users).where(eq(users.id,id));
      return { success: true };
    } catch (error) {
      console.error('Błąd przy usuwaniu użytkownika:', error);
      return fail(500, { message: 'Błąd przy usuwaniu użytkownika' });
    }
  }
} satisfies Actions;