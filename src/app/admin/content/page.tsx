"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Plus, Pencil, Trash2, Eye, EyeOff, X, Home } from "lucide-react";
import { clsx } from "clsx";
import PageContentEditor from "./PageContentEditor";

type Tab = "services" | "articles" | "courses" | "testimonials" | "pages";

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  order: number;
  isActive: boolean;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string | null;
  isPublished: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  price: number;
  lessons: number;
  isPublished: boolean;
}

interface Testimonial {
  id: string;
  author: string;
  text: string;
  rating: number;
  order: number;
  isActive: boolean;
}

type ServiceForm = Omit<Service, "id">;
type ArticleForm = Omit<Article, "id" | "category"> & { category: string };
type CourseForm = Omit<Course, "id">;
type TestimonialForm = Omit<Testimonial, "id">;

const tabs: { key: Tab; label: string }[] = [
  { key: "services", label: "Услуги" },
  { key: "articles", label: "Статьи" },
  { key: "courses", label: "Курсы" },
  { key: "testimonials", label: "Отзывы" },
  { key: "pages", label: "Страницы" },
];

function slugify(text: string) {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
    ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return text
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>("services");
  const [services, setServices] = useState<Service[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [serviceForm, setServiceForm] = useState<ServiceForm>({
    title: "", slug: "", description: "", icon: "", order: 0, isActive: true,
  });
  const [articleForm, setArticleForm] = useState<ArticleForm>({
    title: "", slug: "", excerpt: "", content: "", category: "", isPublished: true,
  });
  const [courseForm, setCourseForm] = useState<CourseForm>({
    title: "", slug: "", description: "", excerpt: "", price: 0, lessons: 1, isPublished: true,
  });
  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>({
    author: "", text: "", rating: 5, order: 0, isActive: true,
  });

  const apiUrl = (tab: Tab) => `/api/admin/content/${tab}`;

  const fetchData = useCallback(async (tab: Tab) => {
    if (tab === "pages") return;
    const res = await fetch(apiUrl(tab));
    if (!res.ok) return;
    const data = await res.json();
    if (tab === "services") setServices(data);
    else if (tab === "articles") setArticles(data);
    else if (tab === "courses") setCourses(data);
    else setTestimonials(data);
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const openAdd = () => {
    setEditingId(null);
    if (activeTab === "services") setServiceForm({ title: "", slug: "", description: "", icon: "", order: 0, isActive: true });
    else if (activeTab === "articles") setArticleForm({ title: "", slug: "", excerpt: "", content: "", category: "", isPublished: true });
    else if (activeTab === "courses") setCourseForm({ title: "", slug: "", description: "", excerpt: "", price: 0, lessons: 1, isPublished: true });
    else setTestimonialForm({ author: "", text: "", rating: 5, order: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    if (activeTab === "services") {
      const s = services.find((x) => x.id === id)!;
      setServiceForm({ title: s.title, slug: s.slug, description: s.description, icon: s.icon ?? "", order: s.order, isActive: s.isActive });
    } else if (activeTab === "articles") {
      const a = articles.find((x) => x.id === id)!;
      setArticleForm({ title: a.title, slug: a.slug, excerpt: a.excerpt, content: a.content, category: a.category ?? "", isPublished: a.isPublished });
    } else if (activeTab === "courses") {
      const c = courses.find((x) => x.id === id)!;
      setCourseForm({ title: c.title, slug: c.slug, description: c.description, excerpt: c.excerpt, price: c.price, lessons: c.lessons, isPublished: c.isPublished });
    } else {
      const t = testimonials.find((x) => x.id === id)!;
      setTestimonialForm({ author: t.author, text: t.text, rating: t.rating, order: t.order, isActive: t.isActive });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${apiUrl(activeTab)}/${editingId}` : apiUrl(activeTab);

    let body: Record<string, unknown>;
    if (activeTab === "services") body = serviceForm;
    else if (activeTab === "articles") body = articleForm;
    else if (activeTab === "courses") body = courseForm;
    else body = testimonialForm;

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setModalOpen(false);
    fetchData(activeTab);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить?")) return;
    await fetch(`${apiUrl(activeTab)}/${id}`, { method: "DELETE" });
    fetchData(activeTab);
  };

  const currentList = activeTab === "services"
    ? services
    : activeTab === "articles"
    ? articles
    : activeTab === "courses"
    ? courses
    : testimonials;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Контент</h1>
        {activeTab !== "pages" && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={clsx(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pages editor */}
      {activeTab === "pages" && <PageContentEditor />}

      {/* Lists */}
      {activeTab !== "pages" && (currentList.length === 0 ? (
        <p className="py-8 text-center text-gray-500">Нет записей</p>
      ) : (
        <div className="space-y-2">
          {activeTab === "services" &&
            services.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">#{s.order}</span>
                  <span className="text-sm font-medium text-gray-900">{s.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", s.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {s.isActive ? "Активна" : "Неактивна"}
                  </span>
                  <button onClick={() => openEdit(s.id)} className="p-1.5 text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}

          {activeTab === "articles" &&
            articles.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  {a.isPublished ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.category ?? "Без категории"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(a.id)} className="p-1.5 text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}

          {activeTab === "courses" &&
            courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  {c.isPublished ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.lessons} уроков · {c.price} ₽</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(c.id)} className="p-1.5 text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}

          {activeTab === "testimonials" &&
            testimonials.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{t.author}</span>
                  <span className="text-xs text-amber-600">{"★".repeat(t.rating)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", t.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {t.isActive ? "Активен" : "Неактивен"}
                  </span>
                  <button onClick={() => openEdit(t.id)} className="p-1.5 text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
        </div>
      ))}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-modal-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Редактировать" : "Создать"}{" "}
                {activeTab === "services" ? "услугу" : activeTab === "articles" ? "статью" : activeTab === "courses" ? "курс" : "отзыв"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "services" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Название</label>
                    <input type="text" value={serviceForm.title} onChange={(e) => { const t = e.target.value; setServiceForm({ ...serviceForm, title: t, slug: slugify(t) }); }} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                    <input type="text" value={serviceForm.slug} onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Описание</label>
                    <textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} required rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Иконка</label>
                      <input type="text" value={serviceForm.icon ?? ""} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value || null })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" placeholder="название иконки" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Порядок</label>
                      <input type="number" value={serviceForm.order} onChange={(e) => setServiceForm({ ...serviceForm, order: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={serviceForm.isActive} onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                    Активна
                  </label>
                </>
              )}

              {activeTab === "articles" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Название</label>
                    <input type="text" value={articleForm.title} onChange={(e) => { const t = e.target.value; setArticleForm({ ...articleForm, title: t, slug: slugify(t) }); }} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                    <input type="text" value={articleForm.slug} onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Краткое описание</label>
                    <textarea value={articleForm.excerpt} onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })} required rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Содержание</label>
                    <textarea value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} required rows={6} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Категория</label>
                    <input type="text" value={articleForm.category} onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={articleForm.isPublished} onChange={(e) => setArticleForm({ ...articleForm, isPublished: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                    Опубликовано
                  </label>
                </>
              )}

              {activeTab === "courses" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Название</label>
                    <input type="text" value={courseForm.title} onChange={(e) => { const t = e.target.value; setCourseForm({ ...courseForm, title: t, slug: slugify(t) }); }} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                    <input type="text" value={courseForm.slug} onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Описание</label>
                    <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Краткое описание</label>
                    <textarea value={courseForm.excerpt} onChange={(e) => setCourseForm({ ...courseForm, excerpt: e.target.value })} required rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Цена (₽)</label>
                      <input type="number" min={0} step={0.01} value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Уроков</label>
                      <input type="number" min={1} value={courseForm.lessons} onChange={(e) => setCourseForm({ ...courseForm, lessons: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={courseForm.isPublished} onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                    Опубликовано
                  </label>
                </>
              )}

              {activeTab === "testimonials" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Автор</label>
                    <input type="text" value={testimonialForm.author} onChange={(e) => setTestimonialForm({ ...testimonialForm, author: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Текст</label>
                    <textarea value={testimonialForm.text} onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })} required rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Рейтинг</label>
                      <input type="number" min={1} max={5} value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Порядок</label>
                      <input type="number" value={testimonialForm.order} onChange={(e) => setTestimonialForm({ ...testimonialForm, order: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={testimonialForm.isActive} onChange={(e) => setTestimonialForm({ ...testimonialForm, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                    Активен
                  </label>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Отмена
                </button>
                <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white active:scale-[0.97] hover:bg-violet-700">
                  {editingId ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
