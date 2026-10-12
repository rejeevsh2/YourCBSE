import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  ExternalLink,
  File as FileIcon,
  FileAudio,
  FileText,
  Image as ImageIcon,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/components/layout/PortalPage";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  API_BASE_URL,
  apiRequest,
} from "@/lib/auth/http";
import { getAuthToken } from "@/lib/auth/session";

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [
      {
        title: "Media Library — YourTeacher Admin",
      },
      {
        name: "description",
        content:
          "Upload and manage media assets used across YourTeacher.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminMediaPage,
});

type MediaKind =
  | "Image"
  | "Video"
  | "PDF"
  | "Audio"
  | "ZIP"
  | "Document";

type Uploader = {
  id: number;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
};

type MediaAsset = {
  id: number;
  uploaded_by: number | null;
  name: string;
  original_name: string;
  file_name: string;
  kind: MediaKind;
  mime_type: string | null;
  extension: string | null;
  disk: string;
  path: string;
  size_bytes: number;
  alt_text: string | null;
  usage_count: number;
  is_active: boolean;
  url: string | null;
  created_at: string | null;
  updated_at: string | null;
  uploader?: Uploader | null;
};

type EditForm = {
  name: string;
  alt_text: string;
  is_active: boolean;
};

const emptyEditForm: EditForm = {
  name: "",
  alt_text: "",
  is_active: true,
};

function formatBytes(bytes: number) {
  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes /
    1024 ** index;

  return `${value.toFixed(
    index === 0 ? 0 : 2,
  )} ${units[index]}`;
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function getUploaderName(
  asset: MediaAsset,
) {
  return (
    asset.uploader?.fullName ||
    asset.uploader?.name ||
    asset.uploader?.email ||
    "Admin"
  );
}

function getKindIcon(
  kind: MediaKind,
) {
  switch (kind) {
    case "Image":
      return ImageIcon;

    case "Video":
      return Video;

    case "Audio":
      return FileAudio;

    case "PDF":
      return FileText;

    default:
      return FileIcon;
  }
}

async function readJsonResponse(
  response: Response,
) {
  const raw =
    await response.text();

  const clean = raw
    .replace(
      /^[\uFEFF\u200B]+/,
      "",
    )
    .trim();

  if (!clean) {
    return {};
  }

  try {
    return JSON.parse(clean);
  } catch {
    return {};
  }
}

function getFirstError(
  payload: any,
) {
  if (!payload?.errors) {
    return null;
  }

  for (
    const messages of Object.values(
      payload.errors,
    )
  ) {
    if (
      Array.isArray(messages) &&
      messages.length
    ) {
      return String(
        messages[0],
      );
    }
  }

  return null;
}

async function uploadMultipart(
  path: string,
  body: FormData,
) {
  const token =
    getAuthToken();

  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        method: "POST",
        credentials: "include",

        headers: {
          Accept:
            "application/json",
          "X-Requested-With":
            "XMLHttpRequest",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },

        body,
      },
    );

  const payload =
    await readJsonResponse(
      response,
    );

  if (!response.ok) {
    throw new Error(
      getFirstError(payload) ||
        payload?.message ||
        `Request failed (${response.status}).`,
    );
  }

  return payload;
}

function AdminMediaPage() {
  const [assets, setAssets] =
    useState<MediaAsset[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(
      null,
    );

  const [replacingId, setReplacingId] =
    useState<number | null>(
      null,
    );

  const [showUpload, setShowUpload] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(
      null,
    );

  const [displayName, setDisplayName] =
    useState("");

  const [altText, setAltText] =
    useState("");

  const [editingAsset, setEditingAsset] =
    useState<MediaAsset | null>(
      null,
    );

  const [editForm, setEditForm] =
    useState<EditForm>(
      emptyEditForm,
    );

  const [search, setSearch] =
    useState("");

  const [kindFilter, setKindFilter] =
    useState("all");

  const replaceInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const replaceAssetRef =
    useRef<MediaAsset | null>(
      null,
    );

  async function loadAssets() {
    setLoading(true);

    try {
      const result =
        await apiRequest<
          MediaAsset[]
        >(
          "/media-assets",
          {
            method: "GET",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not load media.",
        );
      }

      setAssets(
        Array.isArray(
          result.data,
        )
          ? result.data
          : [],
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load media.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssets();
  }, []);

  const totalStorage =
    useMemo(
      () =>
        assets.reduce(
          (
            total,
            asset,
          ) =>
            total +
            Number(
              asset.size_bytes ||
                0,
            ),
          0,
        ),
      [assets],
    );

  const unusedCount =
    assets.filter(
      (asset) =>
        asset.usage_count === 0,
    ).length;

  const activeCount =
    assets.filter(
      (asset) =>
        asset.is_active,
    ).length;

  const filteredAssets =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return assets.filter(
        (asset) => {
          const matchesSearch =
            !query ||
            asset.name
              .toLowerCase()
              .includes(query) ||
            asset.original_name
              .toLowerCase()
              .includes(query) ||
            (
              asset.alt_text ??
              ""
            )
              .toLowerCase()
              .includes(query);

          const matchesKind =
            kindFilter ===
              "all" ||
            asset.kind ===
              kindFilter;

          return (
            matchesSearch &&
            matchesKind
          );
        },
      );
    }, [
      assets,
      search,
      kindFilter,
    ]);

  function closeUpload() {
    setShowUpload(false);
    setSelectedFile(null);
    setDisplayName("");
    setAltText("");
  }

  async function handleUpload(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedFile) {
      toast.error(
        "Please select a file.",
      );
      return;
    }

    setUploading(true);

    try {
      const body =
        new FormData();

      body.append(
        "file",
        selectedFile,
      );

      if (
        displayName.trim()
      ) {
        body.append(
          "name",
          displayName.trim(),
        );
      }

      if (
        altText.trim()
      ) {
        body.append(
          "alt_text",
          altText.trim(),
        );
      }

      await uploadMultipart(
        "/media-assets",
        body,
      );

      toast.success(
        "Media uploaded successfully.",
      );

      closeUpload();

      await loadAssets();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload media.",
      );
    } finally {
      setUploading(false);
    }
  }

  function openEdit(
    asset: MediaAsset,
  ) {
    setEditingAsset(
      asset,
    );

    setEditForm({
      name: asset.name,
      alt_text:
        asset.alt_text ?? "",
      is_active:
        Boolean(
          asset.is_active,
        ),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeEdit() {
    setEditingAsset(
      null,
    );

    setEditForm(
      emptyEditForm,
    );
  }

  async function handleEdit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingAsset) {
      return;
    }

    if (
      !editForm.name.trim()
    ) {
      toast.error(
        "Please enter a display name.",
      );
      return;
    }

    setSaving(true);

    try {
      const result =
        await apiRequest<MediaAsset>(
          `/media-assets/${editingAsset.id}`,
          {
            method: "PUT",

            body: {
              name:
                editForm.name.trim(),

              alt_text:
                editForm.alt_text.trim() ||
                null,

              is_active:
                editForm.is_active,
            },
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not update media.",
        );
      }

      toast.success(
        "Media updated.",
      );

      closeEdit();

      await loadAssets();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update media.",
      );
    } finally {
      setSaving(false);
    }
  }

  function chooseReplacement(
    asset: MediaAsset,
  ) {
    replaceAssetRef.current =
      asset;

    if (
      replaceInputRef.current
    ) {
      replaceInputRef.current.value =
        "";

      replaceInputRef.current.click();
    }
  }

  async function handleReplacement(
    file: File | null,
  ) {
    const asset =
      replaceAssetRef.current;

    if (
      !asset ||
      !file
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Replace the file for "${asset.name}"?\n\nThe old stored file will be removed.`,
      );

    if (!confirmed) {
      replaceAssetRef.current =
        null;
      return;
    }

    setReplacingId(
      asset.id,
    );

    try {
      const body =
        new FormData();

      body.append(
        "file",
        file,
      );

      await uploadMultipart(
        `/media-assets/${asset.id}/replace`,
        body,
      );

      toast.success(
        "Media file replaced.",
      );

      await loadAssets();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not replace media file.",
      );
    } finally {
      setReplacingId(
        null,
      );

      replaceAssetRef.current =
        null;
    }
  }

  async function deleteAsset(
    asset: MediaAsset,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${asset.name}"?\n\nThe stored file will also be deleted.`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      asset.id,
    );

    try {
      const result =
        await apiRequest(
          `/media-assets/${asset.id}`,
          {
            method:
              "DELETE",
          },
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            "Could not delete media.",
        );
      }

      setAssets(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              asset.id,
          ),
      );

      toast.success(
        "Media deleted.",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete media.",
      );
    } finally {
      setDeletingId(
        null,
      );
    }
  }

  async function copyUrl(
    asset: MediaAsset,
  ) {
    if (!asset.url) {
      toast.error(
        "No public URL available.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(
        asset.url,
      );

      toast.success(
        "URL copied.",
      );
    } catch {
      toast.error(
        "Could not copy URL.",
      );
    }
  }

  return (
    <PortalPage
      portalLabel="Admin"
      portalPath="/admin"
      title="Media Library"
      description="Upload and manage real YourTeacher media assets."
      showNotice={false}
      actions={
        <Button
          type="button"
          className="rounded-2xl"
          onClick={() =>
            setShowUpload(
              true,
            )
          }
        >
          <Upload className="size-4" />
          Upload
        </Button>
      }
    >
      <input
        ref={
          replaceInputRef
        }
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.mp3,.wav,.ogg,.m4a,.pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        onChange={(
          event,
        ) =>
          void handleReplacement(
            event.target
              .files?.[0] ??
              null,
          )
        }
      />

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Assets"
            value={String(
              assets.length,
            )}
            tone="primary"
          />

          <StatCard
            label="Storage used"
            value={formatBytes(
              totalStorage,
            )}
            hint="Media Library files"
            tone="warning"
          />

          <StatCard
            label="Active assets"
            value={String(
              activeCount,
            )}
            tone="success"
          />

          <StatCard
            label="Unused assets"
            value={String(
              unusedCount,
            )}
            hint="Usage count is zero"
          />
        </div>

        {showUpload ? (
          <form
            onSubmit={
              handleUpload
            }
            className="rounded-3xl border bg-card p-5"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                Upload media
              </h2>

              <p className="text-sm text-muted-foreground">
                Select an image,
                video, audio, PDF,
                ZIP or document.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="media-file">
                  File
                </Label>

                <Input
                  id="media-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.mp3,.wav,.ogg,.m4a,.pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  onChange={(
                    event,
                  ) =>
                    setSelectedFile(
                      event
                        .target
                        .files?.[0] ??
                        null,
                    )
                  }
                  required
                />

                {selectedFile ? (
                  <p className="text-xs text-muted-foreground">
                    Selected:{" "}
                    {
                      selectedFile.name
                    }{" "}
                    (
                    {formatBytes(
                      selectedFile.size,
                    )}
                    )
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-name">
                  Display name
                </Label>

                <Input
                  id="media-name"
                  value={
                    displayName
                  }
                  onChange={(
                    event,
                  ) =>
                    setDisplayName(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-alt">
                  Alt text
                </Label>

                <Input
                  id="media-alt"
                  value={
                    altText
                  }
                  onChange={(
                    event,
                  ) =>
                    setAltText(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Optional image description"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                type="submit"
                disabled={
                  uploading ||
                  !selectedFile
                }
              >
                <Upload className="size-4" />

                {uploading
                  ? "Uploading..."
                  : "Upload asset"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={
                  uploading
                }
                onClick={
                  closeUpload
                }
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {editingAsset ? (
          <form
            onSubmit={
              handleEdit
            }
            className="rounded-3xl border bg-card p-5"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                Edit media
              </h2>

              <p className="text-sm text-muted-foreground">
                {
                  editingAsset.original_name
                }
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-media-name">
                  Display name
                </Label>

                <Input
                  id="edit-media-name"
                  value={
                    editForm.name
                  }
                  onChange={(
                    event,
                  ) =>
                    setEditForm({
                      ...editForm,
                      name:
                        event.target
                          .value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-media-alt">
                  Alt text
                </Label>

                <Input
                  id="edit-media-alt"
                  value={
                    editForm.alt_text
                  }
                  onChange={(
                    event,
                  ) =>
                    setEditForm({
                      ...editForm,
                      alt_text:
                        event.target
                          .value,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      editForm.is_active
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditForm({
                        ...editForm,
                        is_active:
                          event.target
                            .checked,
                      })
                    }
                  />

                  Asset is active
                </label>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                type="submit"
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : "Save changes"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={
                  saving
                }
                onClick={
                  closeEdit
                }
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        <div className="flex flex-col gap-3 rounded-3xl border bg-card p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search media..."
              className="pl-9"
            />
          </div>

          <select
            value={
              kindFilter
            }
            onChange={(
              event,
            ) =>
              setKindFilter(
                event.target
                  .value,
              )
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">
              All types
            </option>
            <option value="Image">
              Image
            </option>
            <option value="Video">
              Video
            </option>
            <option value="PDF">
              PDF
            </option>
            <option value="Audio">
              Audio
            </option>
            <option value="ZIP">
              ZIP
            </option>
            <option value="Document">
              Document
            </option>
          </select>

          <Button
            type="button"
            variant="outline"
            disabled={
              loading
            }
            onClick={() =>
              void loadAssets()
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
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center rounded-3xl border bg-card text-sm text-muted-foreground">
            Loading media...
          </div>
        ) : filteredAssets.length ===
          0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed text-center">
            <ImageIcon className="size-9 text-muted-foreground" />

            <p className="font-medium">
              No media assets found
            </p>

            <Button
              type="button"
              onClick={() =>
                setShowUpload(
                  true,
                )
              }
            >
              <Upload className="size-4" />
              Upload first asset
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAssets.map(
              (asset) => {
                const Icon =
                  getKindIcon(
                    asset.kind,
                  );

                return (
                  <li
                    key={
                      asset.id
                    }
                    className="overflow-hidden rounded-3xl border bg-card"
                  >
                    {asset.kind ===
                      "Image" &&
                    asset.url ? (
                      <div className="aspect-[16/8] overflow-hidden bg-muted">
                        <img
                          src={
                            asset.url
                          }
                          alt={
                            asset.alt_text ||
                            asset.name
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/8] items-center justify-center bg-muted/50">
                        <Icon className="size-10 text-muted-foreground" />
                      </div>
                    )}

                    <div className="space-y-3 p-5">
                      <div>
                        <p className="truncate font-semibold">
                          {
                            asset.name
                          }
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {
                            asset.original_name
                          }
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {
                            asset.kind
                          }
                        </Badge>

                        <Badge variant="outline">
                          {formatBytes(
                            asset.size_bytes,
                          )}
                        </Badge>

                        <Badge
                          variant={
                            asset.is_active
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {asset.is_active
                            ? "Active"
                            : "Inactive"}
                        </Badge>

                        <Badge variant="outline">
                          {asset.usage_count >
                          0
                            ? `${asset.usage_count} uses`
                            : "Unused"}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <p>
                          Uploaded:{" "}
                          {formatDate(
                            asset.created_at,
                          )}
                        </p>

                        <p className="truncate">
                          By:{" "}
                          {getUploaderName(
                            asset,
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            !asset.url
                          }
                          onClick={() => {
                            if (
                              asset.url
                            ) {
                              window.open(
                                asset.url,
                                "_blank",
                                "noopener,noreferrer",
                              );
                            }
                          }}
                        >
                          <ExternalLink className="size-4" />
                          Preview
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            !asset.url
                          }
                          onClick={() =>
                            void copyUrl(
                              asset,
                            )
                          }
                        >
                          <Copy className="size-4" />
                          Copy URL
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openEdit(
                              asset,
                            )
                          }
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            replacingId ===
                            asset.id
                          }
                          onClick={() =>
                            chooseReplacement(
                              asset,
                            )
                          }
                        >
                          <Upload className="size-4" />

                          {replacingId ===
                          asset.id
                            ? "Replacing..."
                            : "Replace"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={
                            deletingId ===
                            asset.id
                          }
                          onClick={() =>
                            void deleteAsset(
                              asset,
                            )
                          }
                        >
                          <Trash2 className="size-4" />

                          {deletingId ===
                          asset.id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              },
            )}
          </ul>
        )}
      </div>
    </PortalPage>
  );
}