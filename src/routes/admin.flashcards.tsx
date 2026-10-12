import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Layers3,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/auth/http";

export const Route = createFileRoute("/admin/flashcards")({
  head: () => ({
    meta: [
      {
        title: "Flashcards — YourSchool Admin",
      },
      {
        name: "description",
        content:
          "Manage curriculum flashcard decks and cards.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminFlashcardsPage,
});

type Lesson = {
  id: number;
  title: string;
};

type Flashcard = {
  id: number;
  flashcard_deck_id: number;
  front: string;
  back: string;
  display_order: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type FlashcardDeck = {
  id: number;
  lesson_id: number;
  created_by: number | null;
  title: string;
  description: string | null;
  display_order: number;
  is_published: boolean;
  is_active: boolean;
  cards_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
  lesson?: Lesson | null;
  cards?: Flashcard[];
};

type DeckForm = {
  lesson_id: string;
  title: string;
  description: string;
  display_order: string;
  is_published: boolean;
  is_active: boolean;
};

type CardForm = {
  front: string;
  back: string;
  display_order: string;
  is_active: boolean;
};

const emptyDeckForm: DeckForm = {
  lesson_id: "",
  title: "",
  description: "",
  display_order: "1",
  is_published: false,
  is_active: true,
};

const emptyCardForm: CardForm = {
  front: "",
  back: "",
  display_order: "",
  is_active: true,
};

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminFlashcardsPage() {
  const [decks, setDecks] = useState<
    FlashcardDeck[]
  >([]);

  const [lessons, setLessons] = useState<
    Lesson[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [savingDeck, setSavingDeck] =
    useState(false);

  const [savingCard, setSavingCard] =
    useState(false);

  const [deletingDeckId, setDeletingDeckId] =
    useState<number | null>(null);

  const [deletingCardId, setDeletingCardId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showDeckForm, setShowDeckForm] =
    useState(false);

  const [editingDeckId, setEditingDeckId] =
    useState<number | null>(null);

  const [deckForm, setDeckForm] =
    useState<DeckForm>(emptyDeckForm);

  const [selectedDeck, setSelectedDeck] =
    useState<FlashcardDeck | null>(null);

  const [loadingDeck, setLoadingDeck] =
    useState(false);

  const [showCardForm, setShowCardForm] =
    useState(false);

  const [editingCardId, setEditingCardId] =
    useState<number | null>(null);

  const [cardForm, setCardForm] =
    useState<CardForm>(emptyCardForm);

  async function loadData() {
    setLoading(true);

    try {
      const [decksResult, lessonsResult] =
        await Promise.all([
          apiRequest<FlashcardDeck[]>(
            "/flashcard-decks",
            {
              method: "GET",
            },
          ),
          apiRequest<Lesson[]>("/lessons", {
            method: "GET",
          }),
        ]);

      if (!decksResult.ok) {
        throw new Error(
          decksResult.message ||
            "Could not load flashcard decks.",
        );
      }

      if (!lessonsResult.ok) {
        throw new Error(
          lessonsResult.message ||
            "Could not load lessons.",
        );
      }

      setDecks(
        Array.isArray(decksResult.data)
          ? decksResult.data
          : [],
      );

      setLessons(
        Array.isArray(lessonsResult.data)
          ? lessonsResult.data
          : [],
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load flashcards.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadDeck(deckId: number) {
    setLoadingDeck(true);

    try {
      const result =
        await apiRequest<FlashcardDeck>(
          `/flashcard-decks/${deckId}`,
          {
            method: "GET",
          },
        );

      if (!result.ok || !result.data) {
        throw new Error(
          result.message ||
            "Could not load flashcard deck.",
        );
      }

      setSelectedDeck(result.data);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load flashcard deck.",
      );
    } finally {
      setLoadingDeck(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredDecks = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return decks.filter((deck) => {
      const lessonTitle =
        deck.lesson?.title ?? "";

      const matchesSearch =
        !query ||
        deck.title
          .toLowerCase()
          .includes(query) ||
        lessonTitle
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" &&
          deck.is_published) ||
        (statusFilter === "draft" &&
          !deck.is_published) ||
        (statusFilter === "active" &&
          deck.is_active) ||
        (statusFilter === "inactive" &&
          !deck.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [decks, search, statusFilter]);

  const publishedCount = decks.filter(
    (deck) => deck.is_published,
  ).length;

  const activeCount = decks.filter(
    (deck) => deck.is_active,
  ).length;

  const totalCards = decks.reduce(
    (sum, deck) =>
      sum + Number(deck.cards_count ?? 0),
    0,
  );

  function openCreateDeck() {
    setEditingDeckId(null);
    setDeckForm(emptyDeckForm);
    setShowDeckForm(true);
  }

  function openEditDeck(deck: FlashcardDeck) {
    setEditingDeckId(deck.id);

    setDeckForm({
      lesson_id: String(deck.lesson_id),
      title: deck.title,
      description: deck.description ?? "",
      display_order: String(
        deck.display_order ?? 1,
      ),
      is_published: Boolean(
        deck.is_published,
      ),
      is_active: Boolean(deck.is_active),
    });

    setShowDeckForm(true);
  }

  function closeDeckForm() {
    setShowDeckForm(false);
    setEditingDeckId(null);
    setDeckForm(emptyDeckForm);
  }

  async function handleDeckSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!deckForm.lesson_id) {
      toast.error("Please select a lesson.");
      return;
    }

    if (!deckForm.title.trim()) {
      toast.error(
        "Please enter a deck title.",
      );
      return;
    }

    setSavingDeck(true);

    try {
      const result =
        await apiRequest<FlashcardDeck>(
          editingDeckId
            ? `/flashcard-decks/${editingDeckId}`
            : "/flashcard-decks",
          {
            method: editingDeckId
              ? "PUT"
              : "POST",
            body: {
              lesson_id: Number(
                deckForm.lesson_id,
              ),
              title: deckForm.title.trim(),
              description:
                deckForm.description.trim() ||
                null,
              display_order: Number(
                deckForm.display_order || "1",
              ),
              is_published:
                deckForm.is_published,
              is_active: deckForm.is_active,
            },
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not save flashcard deck.",
        );
      }

      toast.success(
        editingDeckId
          ? "Flashcard deck updated."
          : "Flashcard deck created.",
      );

      closeDeckForm();
      await loadData();

      if (
        editingDeckId &&
        selectedDeck?.id === editingDeckId
      ) {
        await loadDeck(editingDeckId);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save flashcard deck.",
      );
    } finally {
      setSavingDeck(false);
    }
  }

  async function deleteDeck(
    deck: FlashcardDeck,
  ) {
    const confirmed = window.confirm(
      `Delete "${deck.title}"?\n\nAll cards inside this deck will also be deleted.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingDeckId(deck.id);

    try {
      const result = await apiRequest(
        `/flashcard-decks/${deck.id}`,
        {
          method: "DELETE",
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not delete flashcard deck.",
        );
      }

      if (selectedDeck?.id === deck.id) {
        setSelectedDeck(null);
        setShowCardForm(false);
        setEditingCardId(null);
      }

      toast.success(
        "Flashcard deck deleted.",
      );

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete flashcard deck.",
      );
    } finally {
      setDeletingDeckId(null);
    }
  }

  async function manageCards(
    deck: FlashcardDeck,
  ) {
    setShowCardForm(false);
    setEditingCardId(null);
    setCardForm(emptyCardForm);

    await loadDeck(deck.id);
  }

  function closeCardManager() {
    setSelectedDeck(null);
    setShowCardForm(false);
    setEditingCardId(null);
    setCardForm(emptyCardForm);
  }

  function openCreateCard() {
    setEditingCardId(null);
    setCardForm(emptyCardForm);
    setShowCardForm(true);
  }

  function openEditCard(card: Flashcard) {
    setEditingCardId(card.id);

    setCardForm({
      front: card.front,
      back: card.back,
      display_order: String(
        card.display_order ?? 1,
      ),
      is_active: Boolean(card.is_active),
    });

    setShowCardForm(true);
  }

  function closeCardForm() {
    setShowCardForm(false);
    setEditingCardId(null);
    setCardForm(emptyCardForm);
  }

  async function handleCardSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedDeck) {
      toast.error(
        "Please select a flashcard deck.",
      );
      return;
    }

    if (!cardForm.front.trim()) {
      toast.error(
        "Please enter the front of the card.",
      );
      return;
    }

    if (!cardForm.back.trim()) {
      toast.error(
        "Please enter the back of the card.",
      );
      return;
    }

    setSavingCard(true);

    try {
      const payload: Record<
        string,
        unknown
      > = {
        front: cardForm.front.trim(),
        back: cardForm.back.trim(),
        is_active: cardForm.is_active,
      };

      if (cardForm.display_order) {
        payload.display_order = Number(
          cardForm.display_order,
        );
      }

      const result =
        await apiRequest<Flashcard>(
          editingCardId
            ? `/flashcard-decks/${selectedDeck.id}/cards/${editingCardId}`
            : `/flashcard-decks/${selectedDeck.id}/cards`,
          {
            method: editingCardId
              ? "PUT"
              : "POST",
            body: payload,
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not save flashcard.",
        );
      }

      toast.success(
        editingCardId
          ? "Flashcard updated."
          : "Flashcard added.",
      );

      closeCardForm();

      await Promise.all([
        loadDeck(selectedDeck.id),
        loadData(),
      ]);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save flashcard.",
      );
    } finally {
      setSavingCard(false);
    }
  }

  async function deleteCard(
    card: Flashcard,
  ) {
    if (!selectedDeck) {
      return;
    }

    const confirmed = window.confirm(
      `Delete this flashcard?\n\nFront: ${card.front}`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingCardId(card.id);

    try {
      const result = await apiRequest(
        `/flashcard-decks/${selectedDeck.id}/cards/${card.id}`,
        {
          method: "DELETE",
        },
      );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not delete flashcard.",
        );
      }

      toast.success("Flashcard deleted.");

      await Promise.all([
        loadDeck(selectedDeck.id),
        loadData(),
      ]);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete flashcard.",
      );
    } finally {
      setDeletingCardId(null);
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Flashcards"
      description="Create curriculum flashcard decks and manage the cards inside each deck."
      showNotice={false}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total decks"
            value={String(decks.length)}
            hint="Curriculum decks"
            tone="primary"
          />

          <StatCard
            label="Published"
            value={String(publishedCount)}
            hint={`${
              decks.length - publishedCount
            } draft`}
            tone="success"
          />

          <StatCard
            label="Total cards"
            value={String(totalCards)}
            hint="Cards across all decks"
            tone="primary"
          />

          <StatCard
            label="Active decks"
            value={String(activeCount)}
            hint={`${
              decks.length - activeCount
            } inactive`}
            tone="success"
          />
        </div>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-3xl border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search decks or lessons..."
                  className="pl-9"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">
                  All statuses
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() =>
                  void loadData()
                }
              >
                <RefreshCw
                  className={
                    loading
                      ? "size-4 animate-spin"
                      : "size-4"
                  }
                />
                Refresh
              </Button>

              <Button
                type="button"
                onClick={openCreateDeck}
              >
                <Plus className="size-4" />
                New deck
              </Button>
            </div>
          </div>

          {showDeckForm ? (
            <form
              onSubmit={handleDeckSubmit}
              className="rounded-3xl border bg-card p-5 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-lg font-bold">
                  {editingDeckId
                    ? "Edit flashcard deck"
                    : "Create flashcard deck"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  Attach the deck to a lesson,
                  then add its individual
                  flashcards.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deck-lesson">
                    Lesson
                  </Label>

                  <select
                    id="deck-lesson"
                    value={
                      deckForm.lesson_id
                    }
                    onChange={(event) =>
                      setDeckForm({
                        ...deckForm,
                        lesson_id:
                          event.target.value,
                      })
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="">
                      Select lesson
                    </option>

                    {lessons.map(
                      (lesson) => (
                        <option
                          key={lesson.id}
                          value={lesson.id}
                        >
                          {lesson.title}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deck-title">
                    Deck title
                  </Label>

                  <Input
                    id="deck-title"
                    value={deckForm.title}
                    onChange={(event) =>
                      setDeckForm({
                        ...deckForm,
                        title:
                          event.target.value,
                      })
                    }
                    placeholder="Real Numbers Revision"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deck-description">
                    Description
                  </Label>

                  <textarea
                    id="deck-description"
                    value={
                      deckForm.description
                    }
                    onChange={(event) =>
                      setDeckForm({
                        ...deckForm,
                        description:
                          event.target.value,
                      })
                    }
                    placeholder="Short description of this flashcard deck..."
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deck-order">
                    Display order
                  </Label>

                  <Input
                    id="deck-order"
                    type="number"
                    min="1"
                    value={
                      deckForm.display_order
                    }
                    onChange={(event) =>
                      setDeckForm({
                        ...deckForm,
                        display_order:
                          event.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label>Status</Label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        deckForm.is_published
                      }
                      onChange={(event) =>
                        setDeckForm({
                          ...deckForm,
                          is_published:
                            event.target
                              .checked,
                        })
                      }
                    />

                    Published
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        deckForm.is_active
                      }
                      onChange={(event) =>
                        setDeckForm({
                          ...deckForm,
                          is_active:
                            event.target
                              .checked,
                        })
                      }
                    />

                    Active
                  </label>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  type="submit"
                  disabled={savingDeck}
                >
                  {savingDeck
                    ? "Saving..."
                    : editingDeckId
                      ? "Update deck"
                      : "Create deck"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={savingDeck}
                  onClick={closeDeckForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          <div className="overflow-hidden rounded-3xl border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold">
                  Flashcard decks
                </h2>

                <p className="text-sm text-muted-foreground">
                  {filteredDecks.length} of{" "}
                  {decks.length} decks
                </p>
              </div>

              <Layers3 className="size-5 text-muted-foreground" />
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                Loading flashcard decks...
              </div>
            ) : filteredDecks.length ===
              0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
                <Layers3 className="size-8 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    No flashcard decks found
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Create your first
                    curriculum flashcard deck.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={openCreateDeck}
                >
                  <Plus className="size-4" />
                  New deck
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">
                        Deck
                      </th>

                      <th className="px-5 py-3">
                        Lesson
                      </th>

                      <th className="px-5 py-3">
                        Cards
                      </th>

                      <th className="px-5 py-3">
                        Publication
                      </th>

                      <th className="px-5 py-3">
                        Status
                      </th>

                      <th className="px-5 py-3">
                        Updated
                      </th>

                      <th className="px-5 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDecks.map(
                      (deck) => (
                        <tr
                          key={deck.id}
                          className="border-b last:border-b-0 hover:bg-muted/20"
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium">
                              {deck.title}
                            </p>

                            {deck.description ? (
                              <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                {
                                  deck.description
                                }
                              </p>
                            ) : null}
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            {deck.lesson
                              ?.title ??
                              `Lesson ${deck.lesson_id}`}
                          </td>

                          <td className="px-5 py-4">
                            {deck.cards_count ??
                              0}
                          </td>

                          <td className="px-5 py-4">
                            <Badge
                              variant={
                                deck.is_published
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {deck.is_published
                                ? "Published"
                                : "Draft"}
                            </Badge>
                          </td>

                          <td className="px-5 py-4">
                            <Badge
                              variant={
                                deck.is_active
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {deck.is_active
                                ? "Active"
                                : "Inactive"}
                            </Badge>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                            {formatDate(
                              deck.updated_at,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  void manageCards(
                                    deck,
                                  )
                                }
                              >
                                <Layers3 className="size-4" />
                                Cards
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  openEditDeck(
                                    deck,
                                  )
                                }
                              >
                                <Pencil className="size-4" />
                                Edit
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={
                                  deletingDeckId ===
                                  deck.id
                                }
                                onClick={() =>
                                  void deleteDeck(
                                    deck,
                                  )
                                }
                              >
                                <Trash2 className="size-4" />

                                {deletingDeckId ===
                                deck.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedDeck ? (
            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Managing cards
                  </p>

                  <h2 className="text-xl font-bold">
                    {selectedDeck.title}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {selectedDeck.lesson
                      ?.title ??
                      `Lesson ${selectedDeck.lesson_id}`}
                    {" · "}
                    {
                      (
                        selectedDeck.cards ??
                        []
                      ).length
                    }{" "}
                    card
                    {(
                      selectedDeck.cards ??
                      []
                    ).length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={openCreateCard}
                  >
                    <Plus className="size-4" />
                    Add card
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      closeCardManager
                    }
                  >
                    Close
                  </Button>
                </div>
              </div>

              {showCardForm ? (
                <form
                  onSubmit={
                    handleCardSubmit
                  }
                  className="mt-5 rounded-2xl border bg-muted/10 p-4"
                >
                  <h3 className="mb-4 font-semibold">
                    {editingCardId
                      ? "Edit flashcard"
                      : "New flashcard"}
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="card-front">
                        Front
                      </Label>

                      <textarea
                        id="card-front"
                        value={
                          cardForm.front
                        }
                        onChange={(event) =>
                          setCardForm({
                            ...cardForm,
                            front:
                              event.target
                                .value,
                          })
                        }
                        placeholder="Question, term or prompt"
                        rows={4}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card-back">
                        Back
                      </Label>

                      <textarea
                        id="card-back"
                        value={cardForm.back}
                        onChange={(event) =>
                          setCardForm({
                            ...cardForm,
                            back:
                              event.target
                                .value,
                          })
                        }
                        placeholder="Answer or explanation"
                        rows={4}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card-order">
                        Display order
                      </Label>

                      <Input
                        id="card-order"
                        type="number"
                        min="1"
                        value={
                          cardForm.display_order
                        }
                        onChange={(event) =>
                          setCardForm({
                            ...cardForm,
                            display_order:
                              event.target
                                .value,
                          })
                        }
                        placeholder="Automatic"
                      />

                      <p className="text-xs text-muted-foreground">
                        Leave empty for the next
                        automatic position.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Card status
                      </Label>

                      <label className="flex h-10 items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={
                            cardForm.is_active
                          }
                          onChange={(
                            event,
                          ) =>
                            setCardForm({
                              ...cardForm,
                              is_active:
                                event.target
                                  .checked,
                            })
                          }
                        />

                        Active
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      type="submit"
                      disabled={savingCard}
                    >
                      {savingCard
                        ? "Saving..."
                        : editingCardId
                          ? "Update card"
                          : "Add card"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={savingCard}
                      onClick={
                        closeCardForm
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : null}

              <div className="mt-5">
                {loadingDeck ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Loading cards...
                  </div>
                ) : (
                  (() => {
                    const cards =
                      selectedDeck.cards ??
                      [];

                    if (
                      cards.length === 0
                    ) {
                      return (
                        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed text-center">
                          <Layers3 className="size-7 text-muted-foreground" />

                          <div>
                            <p className="font-medium">
                              No cards in this
                              deck
                            </p>

                            <p className="text-sm text-muted-foreground">
                              Add the first front
                              and back flashcard.
                            </p>
                          </div>

                          <Button
                            type="button"
                            onClick={
                              openCreateCard
                            }
                          >
                            <Plus className="size-4" />
                            Add card
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {cards.map(
                          (card) => (
                            <div
                              key={card.id}
                              className="grid gap-4 rounded-2xl border p-4 lg:grid-cols-[70px_1fr_1fr_auto]"
                            >
                              <div>
                                <p className="text-xs uppercase text-muted-foreground">
                                  Order
                                </p>

                                <p className="mt-1 font-semibold">
                                  {
                                    card.display_order
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-xs uppercase text-muted-foreground">
                                  Front
                                </p>

                                <p className="mt-1 whitespace-pre-wrap">
                                  {card.front}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs uppercase text-muted-foreground">
                                  Back
                                </p>

                                <p className="mt-1 whitespace-pre-wrap">
                                  {card.back}
                                </p>
                              </div>

                              <div className="flex items-start gap-2 lg:justify-end">
                                <Badge
                                  variant={
                                    card.is_active
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {card.is_active
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    openEditCard(
                                      card,
                                    )
                                  }
                                >
                                  <Pencil className="size-4" />
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  disabled={
                                    deletingCardId ===
                                    card.id
                                  }
                                  onClick={() =>
                                    void deleteCard(
                                      card,
                                    )
                                  }
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </PortalPage>
  );
}
