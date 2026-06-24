"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Upload, Package } from "lucide-react";
import {
  COLORS,
  RADIUS,
  PageHeader,
  Table,
  TableRow,
  Td,
  Btn,
  Input,
  Textarea,
  Modal,
  EmptyState,
} from "../_components/AdminUI";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  stock: number;
  images: { src: string; alt: string }[] | string[];
}

interface FormState {
  name: string;
  slug: string;
  price: string;
  category: string;
  stock: string;
  description: string;
  images: string[];
}

const EMPTY: FormState = {
  name: "", slug: "", price: "", category: "",
  stock: "", description: "", images: [],
};

function imgSrc(img: unknown): string {
  return typeof img === "string" ? img : (img as { src: string })?.src ?? "";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : data.products || []);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price),
      category: p.category,
      stock: String(p.stock),
      description: "",
      images: (p.images || []).map((img) => imgSrc(img)),
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "lumen_unsigned");
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (data.secure_url) {
        setForm((f) => ({ ...f, images: [...f.images, data.secure_url] }));
      }
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      description: form.description,
      images: form.images,
    };
    try {
      if (editing) {
        await fetch(`/api/products/${editing.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
    } finally {
      setSaving(false);
      closeModal();
      fetchProducts();
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/products/${slug}`, { method: "DELETE" });
    fetchProducts();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        subtitle={`${products.length} ${products.length === 1 ? "product" : "products"} total`}
        actions={
          <Btn onClick={openAdd}>
            <Plus style={{ width: 16, height: 16 }} /> Add Product
          </Btn>
        }
      />

      {loading ? (
        <div style={{ color: COLORS.textMid, padding: 24 }}>Loading…</div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package style={{ width: 32, height: 32 }} />}
          title="No products yet"
          message="Add your first product to populate the catalog."
        />
      ) : (
        <Table columns={["Image", "Name", "Category", "Price", "Stock", "Actions"]}>
          {products.map((p) => (
            <TableRow key={p._id}>
              <Td style={{ width: 64 }}>
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc(p.images[0])}
                    alt={p.name}
                    style={{ width: 44, height: 44, objectFit: "cover", borderRadius: RADIUS.sm }}
                  />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: RADIUS.sm, background: COLORS.field }} />
                )}
              </Td>
              <Td style={{ fontWeight: 500 }}>{p.name}</Td>
              <Td style={{ color: COLORS.textMid, textTransform: "capitalize" }}>{p.category}</Td>
              <Td>${p.price}</Td>
              <Td>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    background: p.stock > 0 ? COLORS.accentSoft : "rgba(255,80,80,0.15)",
                    color: p.stock > 0 ? COLORS.accent : COLORS.danger,
                  }}
                >
                  {p.stock}
                </span>
              </Td>
              <Td>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => openEdit(p)}
                    aria-label={`Edit ${p.name}`}
                    style={{
                      padding: "6px 10px",
                      borderRadius: RADIUS.sm,
                      border: `1px solid ${COLORS.lineStrong}`,
                      backgroundColor: "transparent",
                      color: COLORS.text,
                      cursor: "pointer",
                      transition: "border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.accent)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.lineStrong)}
                  >
                    <Pencil style={{ width: 14, height: 14 }} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.slug)}
                    aria-label={`Delete ${p.name}`}
                    style={{
                      padding: "6px 10px",
                      borderRadius: RADIUS.sm,
                      border: `1px solid ${COLORS.danger}55`,
                      backgroundColor: "transparent",
                      color: COLORS.danger,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </Td>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Add / Edit modal */}
      <Modal open={showModal} onClose={closeModal} title={editing ? "Edit Product" : "Add Product"} width={540}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Product name">
            <Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Aether Flight 1" />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} placeholder="aether-flight-1" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Price ($)">
              <Input value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} placeholder="220" type="number" />
            </Field>
            <Field label="Stock">
              <Input value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} placeholder="50" type="number" />
            </Field>
          </div>
          <Field label="Category">
            <Input value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} placeholder="footwear" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Product description…" />
          </Field>

          <Field label="Images">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: RADIUS.sm,
                cursor: "pointer",
                background: COLORS.field,
                border: `1px dashed ${COLORS.lineStrong}`,
                fontSize: "0.85rem",
                color: COLORS.textMid,
              }}
            >
              <Upload style={{ width: 16, height: 16 }} />
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            </label>

            {form.images.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {form.images.map((url, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: RADIUS.sm }} />
                    <button
                      onClick={() => removeImage(i)}
                      aria-label="Remove image"
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: COLORS.danger,
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>×</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <Btn onClick={handleSave} disabled={saving} style={{ marginTop: 8, justifyContent: "center" }}>
            {saving ? "Saving…" : editing ? "Update Product" : "Create Product"}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: "0.72rem", color: COLORS.textLow, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
