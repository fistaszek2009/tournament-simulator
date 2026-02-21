import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

export const load = (() => {
    return {
      x:"ala"
    };
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
      await db.insert(user).values({
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
  }
} satisfies Actions;