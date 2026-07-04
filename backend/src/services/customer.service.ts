import { and, desc, eq, ilike, ne, or } from "drizzle-orm";

import { db } from "../config/db";
import { customers } from "../models/customers.model";
import { AppError } from "../utils/AppError";

export const listCustomers = async (search?: string) => {
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    return db
      .select()
      .from(customers)
      .where(
        or(
          ilike(customers.name, q),
          ilike(customers.email, q),
          ilike(customers.phone, q),
        ),
      )
      .orderBy(desc(customers.created_at))
      .limit(50);
  }

  return db
    .select()
    .from(customers)
    .orderBy(desc(customers.created_at))
    .limit(50);
};

export const getCustomer = async (id: string) => {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
};

interface CustomerInput {
  name: string;
  email: string;
  phone: string;
}

const normalize = (input: CustomerInput) => ({
  name: input.name.trim(),
  email: input.email.toLowerCase().trim(),
  phone: input.phone.trim(),
});

export const createCustomer = async (input: CustomerInput) => {
  const { name, email, phone } = normalize(input);

  const existing = await db.query.customers.findFirst({
    where: or(eq(customers.email, email), eq(customers.phone, phone)),
  });
  if (existing) {
    throw new AppError(
      "A customer with this email or phone already exists",
      409,
    );
  }

  const [created] = await db
    .insert(customers)
    .values({ name, email, phone })
    .returning();
  return created;
};

export const updateCustomer = async (
  id: string,
  input: Partial<CustomerInput>,
) => {
  const existing = await getCustomer(id);

  const patch = {
    name: input.name?.trim() ?? existing.name,
    email: input.email?.toLowerCase().trim() ?? existing.email,
    phone: input.phone?.trim() ?? existing.phone,
  };

  if (patch.email !== existing.email || patch.phone !== existing.phone) {
    const conflict = await db.query.customers.findFirst({
      where: and(
        ne(customers.id, id),
        or(eq(customers.email, patch.email), eq(customers.phone, patch.phone)),
      ),
    });
    if (conflict) {
      throw new AppError(
        "Another customer already uses this email or phone",
        409,
      );
    }
  }

  const [updated] = await db
    .update(customers)
    .set(patch)
    .where(eq(customers.id, id))
    .returning();
  return updated;
};

export const deleteCustomer = async (id: string) => {
  await getCustomer(id);
  await db.delete(customers).where(eq(customers.id, id));
};
