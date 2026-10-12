import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CreditCard,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/auth/http";

type Lesson = {
  id: number;
  title: string;
  is_published: boolean;
};

type Flashcard = {
  id: number;
  flashcard_deck_id: number;
  front: string;
  back: string;
  display_order: number;
  is_active: boolean;
};

type FlashcardDeck = {
  id: number;
  lesson_id: number;
  created_by: number;
  title: string;
  description: string | null;
  display_order: number;
  is_published: boolean;
  is_active: boolean;
  cards_count?: number;
  lesson?: Lesson | null;
  cards?: Flashcard[];
};

type DeckListResponse = {
  decks: FlashcardDeck[];
};

type DeckResponse = {
  deck: FlashcardDeck;
};

type LessonResponse = {
  lessons: Lesson[];
};

export const Route = createFileRoute("/teacher/flashcards")({
  component: TeacherFlashcardsPage,
});

function TeacherFlashcardsPage() {
  const [decks, setDecks] =
    useState<FlashcardDeck[]>([]);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [selectedDeckId, setSelectedDeckId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [savingDeck, setSavingDeck] =
    useState(false);

  const [savingCard, setSavingCard] =
    useState(false);

  const [editingDeckId, setEditingDeckId] =
    useState<number | null>(null);

  const [editingCardId, setEditingCardId] =
    useState<number | null>(null);

  const [deckTitle, setDeckTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [lessonId, setLessonId] =
    useState<number | null>(null);

  const [front, setFront] =
    useState("");

  const [back, setBack] =
    useState("");

  const selectedDeck =
    useMemo(
      () =>
        decks.find(
          (deck) =>
            deck.id === selectedDeckId,
        ) ?? null,
      [decks, selectedDeckId],
    );

  async function loadData() {
    setLoading(true);

    const [deckResult, lessonResult] =
      await Promise.all([
        apiRequest<DeckListResponse>(
          "/teacher/flashcard-decks",
          {
            method: "GET",
          },
        ),
        apiRequest<LessonResponse>(
          "/teacher/lessons",
          {
            method: "GET",
          },
        ),
      ]);

    if (
      deckResult.ok &&
      deckResult.data
    ) {
      const loaded =
        deckResult.data.decks;

      setDecks(loaded);

      setSelectedDeckId(
        (current) =>
          current ??
          loaded[0]?.id ??
          null,
      );
    } else {
      toast.error(
        deckResult.message ??
          "Unable to load flashcard decks.",
      );
    }

    if (
      lessonResult.ok &&
      lessonResult.data
    ) {
      setLessons(
        lessonResult.data.lessons,
      );

      setLessonId(
        (current) =>
          current ??
          lessonResult.data
            ?.lessons[0]?.id ??
          null,
      );
    } else {
      toast.error(
        lessonResult.message ??
          "Unable to load lessons.",
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  function replaceDeck(
    deck: FlashcardDeck,
  ) {
    setDecks((current) => {
      const exists =
        current.some(
          (item) =>
            item.id === deck.id,
        );

      if (exists) {
        return current.map(
          (item) =>
            item.id === deck.id
              ? deck
              : item,
        );
      }

      return [...current, deck];
    });

    setSelectedDeckId(deck.id);
  }

  function resetDeckForm() {
    setEditingDeckId(null);
    setDeckTitle("");
    setDescription("");
    setLessonId(
      lessons[0]?.id ?? null,
    );
  }

  function editDeck(
    deck: FlashcardDeck,
  ) {
    setEditingDeckId(deck.id);
    setDeckTitle(deck.title);
    setDescription(
      deck.description ?? "",
    );
    setLessonId(deck.lesson_id);
  }

  async function saveDeck(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!lessonId) {
      toast.error(
        "Select a lesson.",
      );
      return;
    }

    setSavingDeck(true);

    const result =
      await apiRequest<DeckResponse>(
        editingDeckId
          ? `/teacher/flashcard-decks/${editingDeckId}`
          : "/teacher/flashcard-decks",
        {
          method:
            editingDeckId
              ? "PUT"
              : "POST",
          body: {
            lesson_id: lessonId,
            title: deckTitle.trim(),
            description:
              description.trim() ||
              null,
            is_active: true,
          },
        },
      );

    if (
      result.ok &&
      result.data?.deck
    ) {
      replaceDeck(
        result.data.deck,
      );

      toast.success(
        editingDeckId
          ? "Flashcard deck updated."
          : "Flashcard deck created.",
      );

      resetDeckForm();
    } else {
      toast.error(
        result.message ??
          "Unable to save flashcard deck.",
      );
    }

    setSavingDeck(false);
  }

  async function deleteDeck(
    deck: FlashcardDeck,
  ) {
    if (
      !window.confirm(
        `Delete "${deck.title}" and all cards in it?`,
      )
    ) {
      return;
    }

    const result =
      await apiRequest(
        `/teacher/flashcard-decks/${deck.id}`,
        {
          method: "DELETE",
        },
      );

    if (!result.ok) {
      toast.error(
        result.message ??
          "Unable to delete deck.",
      );
      return;
    }

    setDecks((current) =>
      current.filter(
        (item) =>
          item.id !== deck.id,
      ),
    );

    if (
      selectedDeckId === deck.id
    ) {
      const next =
        decks.find(
          (item) =>
            item.id !== deck.id,
        );

      setSelectedDeckId(
        next?.id ?? null,
      );
    }

    if (
      editingDeckId === deck.id
    ) {
      resetDeckForm();
    }

    toast.success(
      "Flashcard deck deleted.",
    );
  }

  function resetCardForm() {
    setEditingCardId(null);
    setFront("");
    setBack("");
  }

  function editCard(
    card: Flashcard,
  ) {
    setEditingCardId(card.id);
    setFront(card.front);
    setBack(card.back);
  }

  async function saveCard(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!selectedDeck) {
      toast.error(
        "Select a deck first.",
      );
      return;
    }

    setSavingCard(true);

    const result =
      await apiRequest<DeckResponse>(
        editingCardId
          ? `/teacher/flashcard-decks/${selectedDeck.id}/cards/${editingCardId}`
          : `/teacher/flashcard-decks/${selectedDeck.id}/cards`,
        {
          method:
            editingCardId
              ? "PUT"
              : "POST",
          body: {
            front: front.trim(),
            back: back.trim(),
            is_active: true,
          },
        },
      );

    if (
      result.ok &&
      result.data?.deck
    ) {
      replaceDeck(
        result.data.deck,
      );

      toast.success(
        editingCardId
          ? "Flashcard updated."
          : "Flashcard added.",
      );

      resetCardForm();
    } else {
      toast.error(
        result.message ??
          "Unable to save flashcard.",
      );
    }

    setSavingCard(false);
  }

  async function deleteCard(
    card: Flashcard,
  ) {
    if (!selectedDeck) {
      return;
    }

    if (
      !window.confirm(
        "Delete this flashcard?",
      )
    ) {
      return;
    }

    const result =
      await apiRequest<DeckResponse>(
        `/teacher/flashcard-decks/${selectedDeck.id}/cards/${card.id}`,
        {
          method: "DELETE",
        },
      );

    if (
      result.ok &&
      result.data?.deck
    ) {
      replaceDeck(
        result.data.deck,
      );

      if (
        editingCardId === card.id
      ) {
        resetCardForm();
      }

      toast.success(
        "Flashcard deleted.",
      );
    } else {
      toast.error(
        result.message ??
          "Unable to delete flashcard.",
      );
    }
  }

  if (loading) {
    return (
      <PortalPage
        portalLabel="Teacher"
        portalPath="/teacher"
        title="Flashcards"
        description="Create flashcard decks for your lessons."
        showNotice={false}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading flashcards...
        </div>
      </PortalPage>
    );
  }

  return (
    <PortalPage
      portalLabel="Teacher"
      portalPath="/teacher"
      title="Flashcards"
      description="Create and manage draft flashcard decks for your lessons."
      showNotice={false}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card>
          <CardHeader>
            <CardTitle>
              Your decks
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {decks.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <CreditCard className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-medium">
                  No flashcard decks yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first deck using one of your lessons.
                </p>
              </div>
            ) : (
              decks.map((deck) => (
                <div
                  key={deck.id}
                  className={`rounded-xl border p-4 ${
                    selectedDeckId ===
                    deck.id
                      ? "border-primary"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                      setSelectedDeckId(
                        deck.id,
                      );
                      resetCardForm();
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {deck.title}
                      </span>

                      <Badge variant="outline">
                        {deck.cards?.length ??
                          deck.cards_count ??
                          0}{" "}
                        cards
                      </Badge>

                      <Badge
                        variant={
                          deck.is_published
                            ? "default"
                            : "secondary"
                        }
                      >
                        {deck.is_published
                          ? "Published"
                          : "Draft"}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {deck.lesson?.title ??
                        "Lesson"}
                    </p>
                  </button>

                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={
                        deck.is_published
                      }
                      onClick={() =>
                        editDeck(deck)
                      }
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={
                        deck.is_published
                      }
                      onClick={() => {
                        void deleteDeck(
                          deck,
                        );
                      }}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>
                {editingDeckId
                  ? "Edit deck"
                  : "New deck"}
              </CardTitle>

              {editingDeckId ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={
                    resetDeckForm
                  }
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>
          </CardHeader>

          <CardContent>
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create a lesson before creating flashcards.
              </p>
            ) : (
              <form
                className="space-y-4"
                onSubmit={saveDeck}
              >
                <div className="space-y-2">
                  <Label htmlFor="deck-lesson">
                    Lesson
                  </Label>

                  <select
                    id="deck-lesson"
                    className="w-full rounded-lg border bg-background p-2"
                    value={
                      lessonId ?? ""
                    }
                    onChange={(event) =>
                      setLessonId(
                        Number(
                          event.target
                            .value,
                        ),
                      )
                    }
                  >
                    {lessons.map(
                      (lesson) => (
                        <option
                          key={
                            lesson.id
                          }
                          value={
                            lesson.id
                          }
                          disabled={
                            lesson.is_published
                          }
                        >
                          {
                            lesson.title
                          }
                          {lesson.is_published
                            ? " (Published)"
                            : ""}
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
                    required
                    value={deckTitle}
                    onChange={(event) =>
                      setDeckTitle(
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deck-description">
                    Description
                  </Label>

                  <Textarea
                    id="deck-description"
                    rows={4}
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <Button
                  type="submit"
                  disabled={savingDeck}
                >
                  {savingDeck ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : editingDeckId ? (
                    <Save className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}

                  {savingDeck
                    ? "Saving..."
                    : editingDeckId
                      ? "Save deck"
                      : "Create deck"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDeck ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <Card>
            <CardHeader>
              <CardTitle>
                Cards in{" "}
                {selectedDeck.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {selectedDeck.is_published ? (
                <p className="rounded-xl border p-4 text-sm text-muted-foreground">
                  This deck is published. Ask an administrator to unpublish it before editing.
                </p>
              ) : null}

              {(selectedDeck.cards ??
                []).length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No cards in this deck yet.
                </div>
              ) : (
                (
                  selectedDeck.cards ??
                  []
                ).map(
                  (
                    card,
                    index,
                  ) => (
                    <div
                      key={card.id}
                      className="rounded-xl border p-4"
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        Card{" "}
                        {index + 1}
                      </p>

                      <p className="mt-2 font-medium">
                        {card.front}
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {card.back}
                      </p>

                      <div className="mt-3 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            selectedDeck.is_published
                          }
                          onClick={() =>
                            editCard(
                              card,
                            )
                          }
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={
                            selectedDeck.is_published
                          }
                          onClick={() => {
                            void deleteCard(
                              card,
                            );
                          }}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ),
                )
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  {editingCardId
                    ? "Edit card"
                    : "Add card"}
                </CardTitle>

                {editingCardId ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={
                      resetCardForm
                    }
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </div>
            </CardHeader>

            <CardContent>
              {selectedDeck.is_published ? (
                <p className="text-sm text-muted-foreground">
                  Published decks cannot be edited by teachers.
                </p>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={saveCard}
                >
                  <div className="space-y-2">
                    <Label htmlFor="card-front">
                      Front
                    </Label>

                    <Textarea
                      id="card-front"
                      required
                      rows={4}
                      value={front}
                      onChange={(event) =>
                        setFront(
                          event.target
                            .value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-back">
                      Back
                    </Label>

                    <Textarea
                      id="card-back"
                      required
                      rows={5}
                      value={back}
                      onChange={(event) =>
                        setBack(
                          event.target
                            .value,
                        )
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={savingCard}
                  >
                    {savingCard ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : editingCardId ? (
                      <Save className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}

                    {savingCard
                      ? "Saving..."
                      : editingCardId
                        ? "Save card"
                        : "Add card"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </PortalPage>
  );
}