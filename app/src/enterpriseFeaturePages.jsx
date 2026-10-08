import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FileBarChart,
  FileText,
  Filter,
  ImagePlus,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { downloadMock, notify, openAction } from "./ui";
import { ContextualBoundary } from "./contextual-boundary";

const ASSET = "/";
const products = [
  {
    id: "p1",
    name: "Tracteur Massey Ferguson 375",
    category: "Tracteur",
    filter: "Tracteurs",
    description:
      "Tracteur polyvalent de 75 CV, idéal pour les travaux de préparation des sols et le transport. État neuf.",
    price: "8,500,000",
    unit: "FCFA",
    stock: 5,
    image: "tractor3.png",
  },
  {
    id: "p2",
    name: "Herse à disques 18 disques",
    category: "Outils",
    filter: "Outils & Équipements",
    description:
      "Herse robuste pour un enfouissement optimal des résidus. Attelage 3 points standard.",
    price: "1,250,000",
    unit: "FCFA",
    stock: 12,
    image: "tractor4.png",
  },
  {
    id: "p3",
    name: "Pulvérisateur 16L Manuel",
    category: "Équipement",
    filter: "Équipement",
    description:
      "Pulvérisateur à dos manuel, capacité 16 litres. Idéal pour les petits traitements phytosanitaires.",
    price: "28,000",
    unit: "FCFA",
    stock: 2,
    image: "scene_intrants.png",
  },
];
const services = [
  {
    id: "s1",
    name: "Service de labour",
    category: "Services agricoles",
    description: "Labour mécanisé avec chauffeur dans le Grand Cotonou.",
    price: "75,000 FCFA / jour",
    stock: "Disponible",
    image: "scene_tractor.png",
    status: "Actif",
  },
  {
    id: "s2",
    name: "Location de tracteur",
    category: "Location de machines",
    description: "Tracteur avec opérateur pour vos travaux agricoles.",
    price: "45,000 FCFA / jour",
    stock: "Disponible",
    image: "tractor3.png",
    status: "Actif",
  },
  {
    id: "s3",
    name: "Maintenance préventive",
    category: "Services de maintenance",
    description: "Contrat annuel de contrôle et entretien de vos machines.",
    price: "Sur devis",
    stock: "Sur demande",
    image: "reparation1.png",
    status: "Actif",
  },
];
function Frame({ title, subtitle, action, children }) {
  return (
    <ContextualBoundary role="entreprise" title={title}>
      <main className="enterprise-feature-page">
        <div className="enterprise-feature-heading">
          <div>
            <span className="reference-overline">ENTREPRISE</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {action}
        </div>
        {children}
      </main>
    </ContextualBoundary>
  );
}
function Panel({ title, subtitle, children }) {
  return (
    <section className="enterprise-feature-panel">
      <header>
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

const catalogueReferenceProducts = [
  {
    id: "MF-375",
    name: "Tracteur Massey Ferguson 375",
    category: "Tracteur",
    filter: "Tracteurs",
    description:
      "Tracteur polyvalent de 75 CV, idéal pour les travaux de préparation des sols et le transport. État neuf.",
    price: "8,500,000",
    stock: "5 en stock",
    image: "tractor3.png",
    low: false,
  },
  {
    id: "HD-018",
    name: "Herse à disques 18 disques",
    category: "Outils",
    filter: "Outils & Équipements",
    description:
      "Herse robuste pour un enfouissement optimal des résidus. Attelage 3 points standard.",
    price: "1,250,000",
    stock: "12 en stock",
    image: "tractor4.png",
    low: false,
  },
  {
    id: "PUL-016",
    name: "Pulvérisateur 16L Manuel",
    category: "Équipement",
    filter: "Équipement",
    description:
      "Pulvérisateur à dos manuel, capacité 16 litres. Idéal pour les petits traitements phytosanitaires.",
    price: "28,000",
    stock: "2 restants",
    image: "scene_intrants.png",
    low: true,
  },
];

export function EnterpriseCatalogReferencePage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tous les produits");
  const [sort, setSort] = useState("Plus récents");
  const [modal, setModal] = useState(null);
  const filters = [
    "Tous les produits",
    "Tracteurs",
    "Outils & Équipements",
    "Pièces Détachées",
    "Services",
  ];
  const filtered = catalogueReferenceProducts
    .filter(
      (item) =>
        (!query ||
          `${item.name} ${item.description}`
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        (filter === "Tous les produits" || item.filter === filter),
    )
    .sort((a, b) =>
      sort === "Prix croissant"
        ? Number(a.price.replace(/,/g, "")) - Number(b.price.replace(/,/g, ""))
        : sort === "Prix décroissant"
          ? Number(b.price.replace(/,/g, "")) -
            Number(a.price.replace(/,/g, ""))
          : sort === "Stock faible"
            ? a.stock.localeCompare(b.stock, undefined, { numeric: true })
            : 0,
    );
  return (
    <Frame
      title="Catalogue"
      subtitle="Gérez vos produits, équipements et services agricoles."
      action={
        <button className="enterprise-primary" onClick={() => setModal({})}>
          <Plus size={15} /> Ajouter un produit
        </button>
      }
    >
      <div className="enterprise-catalogue-controls">
        <label>
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher dans le catalogue..."
          />
        </label>
        <div className="enterprise-catalogue-filters">
          {filters.map((value) => (
            <button
              className={filter === value ? "active" : ""}
              key={value}
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <label className="enterprise-sort">
          <Filter size={14} /> Trier par:
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option>Plus récents</option>
            <option>Prix croissant</option>
            <option>Prix décroissant</option>
            <option>Stock faible</option>
          </select>
        </label>
      </div>
      <div className="enterprise-reference-grid">
        {filtered.map((item) => (
          <article className="enterprise-reference-card" key={item.name}>
            <div className="enterprise-reference-image">
              <img src={`${ASSET}${item.image}`} alt={item.name} />
              <button onClick={() => setModal(item)}>
                <Edit3 size={14} />
              </button>
              <span>{item.category}</span>
            </div>
            <div className="enterprise-reference-card-body">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="enterprise-reference-card-footer">
                <div>
                  <small>PRIX UNITAIRE</small>
                  <strong>
                    {item.price} <em>FCFA</em>
                  </strong>
                </div>
                <div>
                  <small>STOCK</small>
                  <span className={item.low ? "low" : ""}>
                    {item.low && <AlertTriangle size={12} />}
                    {!item.low && <CheckCircle2 size={12} />}
                    {item.stock}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
        <button
          className="enterprise-reference-add"
          onClick={() => setModal({})}
        >
          <span>
            <Plus size={28} />
          </span>
          <h3>Ajouter au catalogue</h3>
          <p>Créez une nouvelle fiche produit, équipement ou service.</p>
        </button>
      </div>
      {modal && (
        <ProductForm
          item={modal.name ? modal : null}
          onSave={() => {
            setModal(null);
            notify("Produit enregistré.");
          }}
          onCancel={() => setModal(null)}
        />
      )}
    </Frame>
  );
}

export function EnterpriseProductsPage() {
  const [items, setItems] = useState(
    catalogueReferenceProducts.map((item) => ({
      ...item,
      status: item.low ? "À réapprovisionner" : "Publié",
    })),
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [modal, setModal] = useState(null);
  const filters = ["Tous", "Tracteurs", "Outils & Équipements", "Équipement"];
  const filtered = items.filter(
    (item) =>
      (!query ||
        `${item.name} ${item.category}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (filter === "Tous" || item.filter === filter),
  );
  const save = (item) => {
    setItems((current) =>
      item.id
        ? current.map((row) =>
            row.name === item.name ? { ...row, ...item } : row,
          )
        : [
            ...current,
            { ...item, id: `product-${Date.now()}`, status: "Brouillon" },
          ],
    );
    setModal(null);
    notify("Produit enregistré dans l’inventaire.");
  };
  return (
    <Frame
      title="Produits"
      subtitle="Gérez votre inventaire, vos stocks et la publication de vos produits."
      action={
        <button className="enterprise-primary" onClick={() => setModal({})}>
          <Plus size={15} /> Ajouter un produit
        </button>
      }
    >
      <div className="enterprise-inventory-summary">
        <b>
          <strong>{items.length}</strong>
          <span>Produits au catalogue</span>
          <small>+2 ce mois</small>
        </b>
        <b>
          <strong>
            {items.reduce((total, item) => total + Number(item.stock || 0), 0)}
          </strong>
          <span>Unités en stock</span>
          <small>Stock disponible</small>
        </b>
        <b>
          <strong>{items.filter((item) => item.low).length}</strong>
          <span>Stock faible</span>
          <small>À réapprovisionner</small>
        </b>
        <b>
          <strong>
            {items.filter((item) => item.status === "Publié").length}
          </strong>
          <span>Produits publiés</span>
          <small>Visibles au catalogue</small>
        </b>
      </div>
      <div className="enterprise-products-toolbar">
        <label>
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit, une marque..."
          />
        </label>
        <div>
          {filters.map((value) => (
            <button
              className={filter === value ? "active" : ""}
              key={value}
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <button onClick={() => notify("Options de tri ouvertes.")}>
          <Filter size={14} /> Trier
        </button>
      </div>
      <Panel
        title="Inventaire produits"
        subtitle={`${filtered.length} produits correspondent à vos critères.`}
      >
        <div className="enterprise-inventory-table">
          <div className="enterprise-inventory-head">
            <span>Produit</span>
            <span>Catégorie</span>
            <span>Prix unitaire</span>
            <span>Stock</span>
            <span>Publication</span>
            <span>Actions</span>
          </div>
          {filtered.map((item) => (
            <div className="enterprise-inventory-row" key={item.name}>
              <div>
                <img src={`${ASSET}${item.image}`} alt="" />
                <span>
                  <b>{item.name}</b>
                  <small>Référence {item.id.toUpperCase()}</small>
                </span>
              </div>
              <span>{item.category}</span>
              <strong>
                {item.price} <small>FCFA</small>
              </strong>
              <span className={item.low ? "inventory-low" : "inventory-ok"}>
                {item.stock} unités
              </span>
              <span
                className={
                  item.status === "Publié"
                    ? "enterprise-status"
                    : "inventory-draft"
                }
              >
                {item.status}
              </span>
              <div>
                <button onClick={() => setModal(item)} aria-label="Modifier">
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => notify(`${item.name} : aperçu ouvert.`)}
                  aria-label="Voir"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      {modal && (
        <ProductForm
          item={modal.name ? modal : null}
          onSave={save}
          onCancel={() => setModal(null)}
        />
      )}
    </Frame>
  );
}
function ProductForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState(
    item || {
      name: "",
      category: "Tracteurs",
      description: "",
      price: "",
      stock: 1,
      image: "tractor4.png",
    },
  );
  const update = (patch) => setForm((current) => ({ ...current, ...patch }));
  return (
    <div className="enterprise-modal-backdrop">
      <form
        className="enterprise-modal"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.name || !form.price)
            return notify("Complétez le nom et le prix.", "error");
          onSave(form);
        }}
      >
        <button
          type="button"
          className="enterprise-modal-close"
          onClick={onCancel}
        >
          <X size={17} />
        </button>
        <span className="reference-overline">CATALOGUE</span>
        <h3>{item ? "Modifier le produit" : "Ajouter au catalogue"}</h3>
        <label>
          Image produit
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              event.target.files?.[0] &&
              update({ image: URL.createObjectURL(event.target.files[0]) })
            }
          />
        </label>
        <div className="enterprise-image-preview">
          <img
            src={`${form.image.startsWith("blob:") ? form.image : `${ASSET}${form.image}`}`}
            alt="Aperçu du produit"
          />
          <ImagePlus size={18} />
        </div>
        <label>
          Nom du produit
          <input
            value={form.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="Ex : Tracteur Massey Ferguson 375"
          />
        </label>
        <div className="enterprise-form-grid">
          <label>
            Catégorie
            <select
              value={form.category}
              onChange={(event) => update({ category: event.target.value })}
            >
              <option>Tracteurs</option>
              <option>Outils & Équipements</option>
              <option>Pièces Détachées</option>
              <option>Services</option>
            </select>
          </label>
          <label>
            Prix
            <input
              value={form.price}
              onChange={(event) => update({ price: event.target.value })}
              placeholder="8,500,000 FCFA"
            />
          </label>
          <label>
            Stock / disponibilité
            <input
              value={form.stock}
              onChange={(event) => update({ stock: event.target.value })}
            />
          </label>
          <label>
            Marque
            <input defaultValue="Massey Ferguson" />
          </label>
        </div>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) => update({ description: event.target.value })}
            placeholder="Décrivez le produit, ses caractéristiques et son état."
          />
        </label>
        <div className="enterprise-modal-actions">
          <button
            type="button"
            className="enterprise-secondary"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button className="enterprise-primary">
            {item ? "Enregistrer les modifications" : "Publier le produit"}{" "}
            <Check size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}

export function EnterpriseCatalogPage({ mode = "products" }) {
  const isServices = mode === "services";
  const [items, setItems] = useState(isServices ? services : products);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(
    isServices ? "Tous les services" : "Tous les produits",
  );
  const [modal, setModal] = useState(null);
  const serviceFilters = [
    "Tous les services",
    "Services agricoles",
    "Location de machines",
    "Services de maintenance",
  ];
  const productFilters = [
    "Tous les produits",
    "Tracteurs",
    "Outils & Équipements",
    "Pièces Détachées",
    "Équipement",
  ];
  const filters = isServices ? serviceFilters : productFilters;
  const filtered = items.filter(
    (item) =>
      (!query ||
        `${item.name} ${item.category}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (category === filters[0] || item.category === category),
  );
  const save = (form) => {
    setItems((current) =>
      form.id
        ? current.map((item) =>
            item.id === form.id ? { ...item, ...form } : item,
          )
        : [
            ...current,
            {
              ...form,
              id: `new-${Date.now()}`,
              status: isServices ? "Actif" : "Brouillon",
            },
          ],
    );
    setModal(null);
    notify(
      form.id
        ? `${isServices ? "Service" : "Produit"} modifié.`
        : `${isServices ? "Service" : "Produit"} ajouté.`,
    );
  };
  return (
    <Frame
      title={
        isServices
          ? "Services"
          : mode === "catalogue"
            ? "Catalogue"
            : "Produits"
      }
      subtitle={
        isServices
          ? "Gérez vos prestations, tarifs et disponibilités."
          : "Gérez vos produits, équipements et services agricoles."
      }
      action={
        <button className="enterprise-primary" onClick={() => setModal({})}>
          <Plus size={15} /> Ajouter {isServices ? "un service" : "un produit"}
        </button>
      }
    >
      <div className="enterprise-toolbar">
        <label>
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              isServices
                ? "Rechercher un service..."
                : "Rechercher dans le catalogue..."
            }
          />
        </label>
        <div>
          {filters.map((value) => (
            <button
              className={category === value ? "active" : ""}
              key={value}
              onClick={() => setCategory(value)}
            >
              {value}
              <ChevronDown size={12} />
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            notify(`Tri des ${isServices ? "services" : "produits"} appliqué.`)
          }
        >
          <Filter size={14} /> Trier
        </button>
      </div>
      <div
        className={`enterprise-product-grid ${isServices ? "enterprise-service-grid" : ""}`}
      >
        {filtered.map((item) => (
          <article className="enterprise-product-card" key={item.id}>
            <div className="enterprise-product-image">
              <img
                src={`${item.image.startsWith("blob:") ? item.image : `${ASSET}${item.image}`}`}
                alt={item.name}
              />
              <span>{item.category}</span>
              <button onClick={() => setModal(item)}>
                <Edit3 size={14} />
              </button>
            </div>
            <div className="enterprise-product-body">
              <span className="enterprise-status">{item.status}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="enterprise-product-meta">
                <strong>{item.price}</strong>
                <span>
                  {isServices ? "Disponibilité" : "Stock"} <b>{item.stock}</b>
                </span>
              </div>
              <div>
                <button
                  className="enterprise-secondary"
                  onClick={() => setModal(item)}
                >
                  Modifier
                </button>
                <button
                  className="enterprise-text-action"
                  onClick={() =>
                    notify(
                      `${isServices ? "Service" : "Produit"} ouvert : ${item.name}`,
                    )
                  }
                >
                  Voir <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </article>
        ))}
        <button className="enterprise-add-card" onClick={() => setModal({})}>
          <Plus size={27} />
          <b>Ajouter {isServices ? "un service" : "au catalogue"}</b>
          <small>
            {isServices
              ? "Publier une prestation et ses disponibilités"
              : "Créer une nouvelle fiche produit"}
          </small>
        </button>
      </div>
      {modal && (
        <ProductForm
          item={modal.id ? modal : null}
          onSave={save}
          onCancel={() => setModal(null)}
        />
      )}
    </Frame>
  );
}

const orders = [
  [
    "#CMD-2025-1456",
    "Koffi Agbodan",
    "Tracteur MF 375",
    "1",
    "8,500,000 FCFA",
    "En attente",
    "01 Juin 2025",
  ],
  [
    "#CMD-2025-1455",
    "Jean Hounkpe",
    "Motopompe Hyundai",
    "1",
    "325,000 FCFA",
    "Payée",
    "01 Juin 2025",
  ],
  [
    "#CMD-2025-1454",
    "Euloge Dossou",
    "Engrais NPK 20-10-10",
    "10",
    "45,000 FCFA",
    "Expédiée",
    "31 Mai 2025",
  ],
  [
    "#CMD-2025-1453",
    "Mohamed Salami",
    "Pulvérisateur 16L",
    "2",
    "28,000 FCFA",
    "Livrée",
    "30 Mai 2025",
  ],
  [
    "#CMD-2025-1452",
    "Arsène Zannou",
    "Herse à disques",
    "1",
    "1,250,000 FCFA",
    "Annulée",
    "29 Mai 2025",
  ],
];
export function EnterpriseOrdersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tous les statuts");
  const [selected, setSelected] = useState(null);
  const filtered = orders.filter(
    (row) =>
      row.join(" ").toLowerCase().includes(query.toLowerCase()) &&
      (status === "Tous les statuts" || row[5] === status),
  );
  const changeStatus = (value) => {
    setSelected((current) =>
      current ? { ...current, status: value } : current,
    );
    notify(`Commande ${value.toLowerCase()}.`);
  };
  return (
    <Frame
      title="Gestion des Commandes"
      subtitle="Suivez et traitez les commandes de vos clients."
      action={
        <button
          className="enterprise-secondary"
          onClick={() =>
            downloadMock(
              "commandes-entreprise",
              orders.map((row) => row.join("|")).join("\n"),
            )
          }
        >
          <Download size={14} /> Exporter
        </button>
      }
    >
      <div className="enterprise-order-kpis">
        <b>
          <strong>2,845</strong>
          <span>Total commandes</span>
          <small>+12.4% vs mois dernier</small>
        </b>
        <b>
          <strong>124</strong>
          <span>Commandes à traiter</span>
          <small>Aujourd’hui</small>
        </b>
        <b>
          <strong>1.2M FCFA</strong>
          <span>Revenus du jour</span>
          <small>+8.6% vs hier</small>
        </b>
      </div>
      <Panel
        title="Liste des commandes"
        subtitle={`Affichage de ${filtered.length} commandes sur 124.`}
      >
        <div className="enterprise-table-toolbar">
          <label>
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher par ID, client..."
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>Tous les statuts</option>
            <option>En attente</option>
            <option>Payée</option>
            <option>Expédiée</option>
            <option>Livrée</option>
            <option>Annulée</option>
          </select>
          <button onClick={() => setQuery("")}>
            <Filter size={14} /> Réinitialiser
          </button>
        </div>
        <div className="enterprise-orders-table">
          <div className="enterprise-orders-head">
            {[
              "ID Commande",
              "Client",
              "Produit(s)",
              "Qté",
              "Montant",
              "Statut",
              "Date",
              "Actions",
            ].map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>
          {filtered.map((row) => (
            <div className="enterprise-order-row" key={row[0]}>
              {row.map((cell, index) =>
                index === 5 ? (
                  <span
                    className={`enterprise-order-status status-${cell.toLowerCase().replace("é", "e")}`}
                    key={cell}
                  >
                    {cell}
                  </span>
                ) : (
                  <span key={cell}>{cell}</span>
                ),
              )}
              <button onClick={() => setSelected({ row, status: row[5] })}>
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))}
        </div>
      </Panel>
      {selected && (
        <div
          className="enterprise-modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="enterprise-modal enterprise-order-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="enterprise-modal-close"
              onClick={() => setSelected(null)}
            >
              <X size={17} />
            </button>
            <span className="reference-overline">DÉTAIL COMMANDE</span>
            <h3>{selected.row[0]}</h3>
            {["Client", "Produit", "Quantité", "Montant", "Date"].map(
              (label, index) => (
                <p key={label}>
                  <b>{label}</b>
                  <span>{selected.row[index + 1]}</span>
                </p>
              ),
            )}
            <label>
              Statut
              <select
                value={selected.status}
                onChange={(event) =>
                  setSelected((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                {["En attente", "Payée", "Expédiée", "Livrée", "Annulée"].map(
                  (value) => (
                    <option key={value}>{value}</option>
                  ),
                )}
              </select>
            </label>
            <button
              className="enterprise-primary"
              onClick={() => {
                changeStatus(selected.status);
                setSelected(null);
              }}
            >
              Enregistrer le statut
            </button>
          </div>
        </div>
      )}
    </Frame>
  );
}

const quotes = [
  {
    id: "q1",
    customer: "Coopérative Agricole du Nord",
    product: "Tracteur Massey Ferguson 375",
    urgency: "Urgence Haute",
    status: "Nouvelle",
    date: "Reçue aujourd’hui à 09:45",
    location: "Parakou, Bénin",
    message:
      "Notre coopérative prévoit d’étendre ses surfaces cultivables pour la prochaine saison des pluies. Nous souhaiterions recevoir votre meilleure proposition.",
  },
  {
    id: "q2",
    customer: "Ferme Bio Assouka",
    product: "Lot de 50 Engrais NPK 20-10-10",
    urgency: "Urgence Moyenne",
    status: "Nouvelle",
    date: "Il y a 2 h",
    location: "Abomey-Calavi, Bénin",
    message:
      "Nous cherchons un approvisionnement régulier pour notre prochaine campagne.",
  },
  {
    id: "q3",
    customer: "Jean Hounkpe (Particulier)",
    product: "Motopompe Hyundai 3 pouces",
    urgency: "Urgence Normale",
    status: "Nouvelle",
    date: "Hier",
    location: "Cotonou, Bénin",
    message:
      "Merci de nous communiquer vos délais de disponibilité et de livraison.",
  },
];
export function EnterpriseQuotesPage() {
  const [quoteRows, setQuoteRows] = useState(quotes);
  const [selected, setSelected] = useState(quotes[0]);
  const [modal, setModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [filters, setFilters] = useState({ urgency: "Toutes", status: "Tous" });
  const visibleQuotes = quoteRows.filter(
    (quote) =>
      (filters.urgency === "Toutes" || quote.urgency === filters.urgency) &&
      (filters.status === "Tous" || quote.status === filters.status),
  );
  const applyFilters = (event) => {
    event.preventDefault();
    const nextSelected = visibleQuotes[0] || null;
    setSelected(nextSelected);
    setFilterModal(false);
    notify(`${visibleQuotes.length} demande(s) affichée(s).`);
  };
  const refuseSelected = () => {
    setQuoteRows((current) =>
      current.map((quote) =>
        quote.id === selected.id ? { ...quote, status: "Refusée" } : quote,
      ),
    );
    setSelected((current) =>
      current ? { ...current, status: "Refusée" } : current,
    );
    notify("Demande refusée.");
  };
  return (
    <Frame
      title="Demandes de devis"
      subtitle="Gérez les demandes entrantes et répondez aux besoins de vos clients."
      action={
        <button
          className="enterprise-secondary"
          onClick={() => setFilterModal(true)}
        >
          <Filter size={14} /> Filtrer
        </button>
      }
    >
      <div className="enterprise-quote-layout">
        <Panel
          title="Demandes entrantes"
          subtitle={`${visibleQuotes.length} demande(s) affichée(s) sur ${quoteRows.length}.`}
        >
          <div className="enterprise-quote-list">
            {visibleQuotes.map((quote) => (
              <button
                className={selected?.id === quote.id ? "active" : ""}
                data-action-handled="true"
                key={quote.id}
                onClick={() => setSelected(quote)}
              >
                <span className="enterprise-quote-avatar">
                  {quote.customer[0]}
                </span>
                <div>
                  <b>{quote.customer}</b>
                  <small>
                    {quote.status} · Demande pour : {quote.product}
                  </small>
                </div>
                <span
                  className={`enterprise-urgency ${quote.urgency.includes("Haute") ? "high" : ""}`}
                >
                  {quote.urgency}
                </span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="Nouvelle demande"
          subtitle={
            selected
              ? `${selected.customer} · ${selected.date}`
              : "Aucune demande sélectionnée"
          }
        >
          {selected ? (
            <div className="enterprise-quote-detail">
              <div className="enterprise-quote-customer">
                <span className="enterprise-quote-avatar">
                  {selected.customer[0]}
                </span>
                <div>
                  <b>{selected.customer}</b>
                  <small>
                    <Truck size={12} /> {selected.location}
                  </small>
                </div>
                <span className="enterprise-urgency high">
                  {selected.status.toUpperCase()}
                </span>
              </div>
              <div className="enterprise-quote-product">
                <img
                  src={`${ASSET}tractor4.png`}
                  alt="Tracteur Massey Ferguson"
                />
                <div>
                  <b>{selected.product}</b>
                  <small>Référence produit · disponibilité immédiate</small>
                  <strong>
                    {selected.product.includes("Tracteur")
                      ? "8,500,000 FCFA"
                      : "Sur devis"}
                  </strong>
                </div>
              </div>
              <div className="enterprise-client-message">
                <span>MESSAGE DU CLIENT</span>
                <p>{selected.message}</p>
              </div>
              <div className="enterprise-modal-actions">
                <button
                  className="enterprise-secondary"
                  onClick={refuseSelected}
                >
                  Refuser
                </button>
                <button
                  className="enterprise-primary"
                  onClick={() => setModal(true)}
                >
                  Répondre avec un devis <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <p>Aucune demande ne correspond à ces filtres.</p>
          )}
        </Panel>
      </div>
      {modal && (
        <div
          className="enterprise-modal-backdrop"
          onClick={() => setModal(false)}
        >
          <form
            className="enterprise-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              setQuoteRows((current) =>
                current.map((quote) =>
                  quote.id === selected.id
                    ? { ...quote, status: "Répondue" }
                    : quote,
                ),
              );
              setSelected((current) =>
                current ? { ...current, status: "Répondue" } : current,
              );
              setModal(false);
              notify("Devis envoyé au client.");
            }}
          >
            <button
              type="button"
              className="enterprise-modal-close"
              onClick={() => setModal(false)}
            >
              <X size={17} />
            </button>
            <span className="reference-overline">NOUVEAU DEVIS</span>
            <h3>{selected?.product}</h3>
            <label>
              Montant proposé
              <input
                defaultValue={
                  selected?.product.includes("Tracteur") ? "8,500,000 FCFA" : ""
                }
              />
            </label>
            <label>
              Délai de livraison
              <select defaultValue="Sous 7 jours">
                <option>Sous 7 jours</option>
                <option>Sous 15 jours</option>
                <option>À convenir</option>
              </select>
            </label>
            <label>
              Message au client
              <textarea defaultValue="Merci pour votre demande. Voici notre proposition commerciale." />
            </label>
            <button className="enterprise-primary">
              Envoyer le devis <SendIcon />
            </button>
          </form>
        </div>
      )}
      {filterModal && (
        <div
          className="enterprise-modal-backdrop"
          onClick={() => setFilterModal(false)}
        >
          <form
            className="enterprise-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={applyFilters}
          >
            <button
              type="button"
              className="enterprise-modal-close"
              onClick={() => setFilterModal(false)}
            >
              <X size={17} />
            </button>
            <span className="reference-overline">FILTRES DES DEMANDES</span>
            <h3>Affiner les demandes de devis</h3>
            <label>
              Niveau d’urgence
              <select
                value={filters.urgency}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    urgency: event.target.value,
                  }))
                }
              >
                <option>Toutes</option>
                <option>Urgence Haute</option>
                <option>Urgence Moyenne</option>
                <option>Urgence Normale</option>
              </select>
            </label>
            <label>
              Statut
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                <option>Tous</option>
                <option>Nouvelle</option>
                <option>Répondue</option>
                <option>Refusée</option>
              </select>
            </label>
            <button className="enterprise-primary">
              Appliquer les filtres <Filter size={14} />
            </button>
          </form>
        </div>
      )}
    </Frame>
  );
}
function SendIcon() {
  return <ArrowRight size={14} />;
}

export function EnterpriseStatsPage() {
  const [period, setPeriod] = useState("Ce semestre");
  const kpis = [
    ["24,750K FCFA", "Chiffre d’affaires", "+18.6%"],
    ["412", "Commandes traitées", "+9.7%"],
    ["60K FCFA", "Panier moyen", "+10.4%"],
    ["3.4%", "Taux de conversion", "-1.2%"],
  ];
  const values =
    period === "Cette année"
      ? [12, 16, 18, 21, 22, 25]
      : [15, 18, 17, 21, 20, 24.75];
  return (
    <Frame
      title="Statistiques Avancées"
      subtitle="Analyse détaillée de vos performances."
      action={
        <div className="enterprise-feature-actions">
          <button
            className="enterprise-secondary"
            data-action-handled="true"
            onClick={() =>
              downloadMock(
                "statistiques-entreprise",
                `Indicateur|Valeur\nChiffre d’affaires|24,750K FCFA\nCommandes traitées|412`,
              )
            }
          >
            <Download size={14} /> Export PDF
          </button>
          <button
            className="enterprise-secondary"
            data-action-handled="true"
            onClick={() =>
              downloadMock(
                "statistiques-entreprise.csv",
                [
                  "Indicateur|Valeur|Évolution",
                  ...kpis.map(
                    ([value, label, trend]) => `${label}|${value}|${trend}`,
                  ),
                ].join("\n"),
              )
            }
          >
            Export CSV
          </button>
        </div>
      }
    >
      <div className="enterprise-stats-kpis">
        {kpis.map(([value, label, trend]) => (
          <b key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
            <small className={trend.startsWith("-") ? "negative" : ""}>
              {trend}
            </small>
          </b>
        ))}
      </div>
      <Panel
        title="Évolution des Revenus"
        subtitle="Comparaison des 6 derniers mois"
      >
        <div className="enterprise-chart-tools">
          <span>
            <i /> Revenus
          </span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option>Ce semestre</option>
            <option>Cette année</option>
          </select>
        </div>
        <div className="enterprise-area-chart">
          <svg viewBox="0 0 700 260" preserveAspectRatio="none">
            <defs>
              <linearGradient id="enterprise-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#106e3f" stopOpacity=".25" />
                <stop offset="1" stopColor="#106e3f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 220 C70 145 95 190 145 164 S210 180 270 105 S350 180 410 72 S475 155 530 52 S620 100 700 20 V260 H0 Z"
              fill="url(#enterprise-area)"
            />
            <path
              d="M0 220 C70 145 95 190 145 164 S210 180 270 105 S350 180 410 72 S475 155 530 52 S620 100 700 20"
              fill="none"
              stroke="#106e3f"
              strokeWidth="3"
            />
            {values.map((value, index) => (
              <circle
                key={value}
                cx={index * 140}
                cy={220 - value * 7}
                r="4"
                fill="#106e3f"
              />
            ))}
          </svg>
          <div>
            {["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"].map((month) => (
              <small key={month}>{month}</small>
            ))}
          </div>
        </div>
      </Panel>
      <div className="enterprise-stats-lower">
        <Panel title="Top Produits" subtitle="Les plus performants.">
          <div className="enterprise-top-products">
            {[
              [
                "Massey Ferguson 375",
                "124 unités vendues",
                "8.5M",
                "tractor4.png",
              ],
              [
                "Engrais NPK 20-10-10",
                "856 sacs vendus",
                "3.8M",
                "product_maize.png",
              ],
              [
                "Motopompe Hyundai 3 pouces",
                "42 unités vendues",
                "1.2M",
                "scene_intrants.png",
              ],
              [
                "Pulvérisateur 16L",
                "210 unités vendues",
                "0.8M",
                "tracteur2.png",
              ],
            ].map(([name, sold, revenue, image]) => (
              <div key={name}>
                <img src={`${ASSET}${image}`} alt="" />
                <span>
                  <b>{name}</b>
                  <small>{sold}</small>
                </span>
                <strong>{revenue}</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Ventes par catégorie" subtitle="Total 1,242 ventes.">
          <div className="enterprise-donut">
            <div>
              <strong>1,242</strong>
              <small>Ventes</small>
            </div>
          </div>
          <div className="enterprise-legend">
            <span>
              <i /> Machines 45%
            </span>
            <span>
              <i /> Intrants 30%
            </span>
            <span>
              <i /> Services 25%
            </span>
          </div>
        </Panel>
        <Panel title="Répartition géographique" subtitle="Clients par ville.">
          <div className="enterprise-geo">
            {[
              ["Cotonou", "45%"],
              ["Parakou", "30%"],
              ["Porto-Novo", "15%"],
              ["Autres", "10%"],
            ].map(([city, value]) => (
              <div key={city}>
                <span>{city}</span>
                <i>
                  <em style={{ width: value }} />
                </i>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Frame>
  );
}

export function EnterpriseCompanyPage() {
  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState({
    name: "MTN Bénin SARL",
    description:
      "Leader dans la distribution d’équipements agricoles de haute précision et de solutions agronomiques en Afrique de l’Ouest.",
    address: "Zone Industrielle de Sèmè-Kpodji, Lot 45B, Cotonou, Bénin",
    email: "contact@mtn-benin-agri.com",
    phone: "+229 21 31 45 67",
  });
  const [draft, setDraft] = useState(company);
  const openEditor = () => {
    setDraft(company);
    setEditing(true);
  };
  return (
    <Frame
      title="Mon Entreprise"
      subtitle="Présentez votre activité et gérez les membres de votre équipe."
      action={
        <button className="enterprise-primary" onClick={openEditor}>
          <Edit3 size={14} /> Modifier le profil
        </button>
      }
    >
      <div className="enterprise-company-top">
        <Panel
          title="Identité de l’entreprise"
          subtitle="Informations publiques de votre société."
        >
          <div className="enterprise-company-identity">
            <img src={`${ASSET}logo.officiel.png`} alt="Logo AGRIMAC" />
            <div>
              <h3>{company.name}</h3>
              <span className="enterprise-status">Vérifiée</span>
              <p>{company.description}</p>
            </div>
          </div>
          <div className="enterprise-company-meta">
            <span>
              <b>Date de création</b>
              <small>15 Janvier 2010</small>
            </span>
            <span>
              <b>Numéro IFU</b>
              <small>3201948576021</small>
            </span>
          </div>
        </Panel>
        <Panel title="Coordonnées" subtitle="Comment joindre votre entreprise.">
          <div className="enterprise-contact-lines">
            <p>
              ◉{" "}
              <span>
                <b>Siège social</b>
                {company.address}
              </span>
            </p>
            <p>
              ✉{" "}
              <span>
                <b>Email principal</b>
                {company.email}
              </span>
            </p>
            <p>
              ☎{" "}
              <span>
                <b>Téléphone</b>
                {company.phone}
              </span>
            </p>
          </div>
        </Panel>
      </div>
      <Panel
        title="Documents vérifiés"
        subtitle="Documents officiels associés à votre entreprise."
      >
        <div className="enterprise-documents">
          {[
            ["Registre du Commerce (RCCM)", "Mis à jour le 12 Mars 2024"],
            ["Attestation Fiscale (IFU)", "Valide jusqu’au 31 Déc 2024"],
            [
              "Relevé d’Identité Bancaire (RIB)",
              "Vérifié par l’administration",
            ],
          ].map(([title, detail]) => (
            <button
              key={title}
              data-action-handled="true"
              onClick={() =>
                openAction({
                  type: "detail",
                  icon: "▤",
                  title,
                  description: `Document officiel associé à ${company.name}.`,
                  fields: [
                    { label: "Document", value: title },
                    { label: "Détail", value: detail },
                    { label: "Statut", value: "Vérifié" },
                    { label: "Action", value: "Disponible dans l’aperçu" },
                  ],
                })
              }
            >
              <FileText size={20} />
              <span>
                <b>{title}</b>
                <small>{detail}</small>
              </span>
              <Check size={15} />
            </button>
          ))}
        </div>
      </Panel>
      <Panel
        title="Membres de l’équipe"
        subtitle="Membres autorisés à gérer ce compte."
      >
        <div className="enterprise-team">
          {[
            [
              "Jean-Paul Koffi",
              "jp.koffi@mtn-benin.com",
              "Directeur Général",
              "Actif",
            ],
            [
              "Amélie Dossou",
              "a.dossou@mtn-benin.com",
              "Responsable Logistique",
              "Actif",
            ],
            [
              "Marc Koundé",
              "m.kounde@mtn-benin.com",
              "Commercial Senior",
              "En congé",
            ],
          ].map((row) => (
            <div key={row[0]}>
              <span className="enterprise-team-avatar">{row[0][0]}</span>
              <span>
                <b>{row[0]}</b>
                <small>{row[1]}</small>
              </span>
              <span>{row[2]}</span>
              <span className="enterprise-status">{row[3]}</span>
              <button
                onClick={() => notify(`Actions ouvertes pour ${row[0]}.`)}
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title="Galerie / Entrepôt"
        subtitle="Présentez vos installations et équipements."
      >
        <div className="enterprise-gallery">
          {[
            "WhatsApp Image 2026-08-05 at 23.57.26.jpeg",
            "entreprise.png",
            "scene_tractor.png",
            "scene_intrants.png",
          ].map((image) => (
            <img
              key={image}
              src={`${ASSET}${image}`}
              alt="Installation entreprise"
            />
          ))}
        </div>
      </Panel>
      {editing && (
        <div
          className="enterprise-modal-backdrop"
          onClick={() => setEditing(false)}
        >
          <form
            className="enterprise-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              setCompany(draft);
              setEditing(false);
              notify("Profil entreprise enregistré.");
            }}
          >
            <button
              type="button"
              className="enterprise-modal-close"
              onClick={() => setEditing(false)}
            >
              <X size={17} />
            </button>
            <span className="reference-overline">PROFIL ENTREPRISE</span>
            <h3>Modifier le profil entreprise</h3>
            <label>
              Nom de l’entreprise
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Description
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Siège social
              <input
                value={draft.address}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
              />
            </label>
            <div className="enterprise-form-grid">
              <label>
                Email principal
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Téléphone
                <input
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="enterprise-modal-actions">
              <button
                type="button"
                className="enterprise-secondary"
                onClick={() => setEditing(false)}
              >
                Annuler
              </button>
              <button className="enterprise-primary">
                Enregistrer <Check size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </Frame>
  );
}

export function EnterpriseSettingsPage() {
  const [settings, setSettings] = useState(() => {
    try {
      return {
        notifications: true,
        email: false,
        profilePublic: true,
        language: "Français",
        displayMode: "Simplifié",
        ...JSON.parse(
          localStorage.getItem("agrimac-enterprise-settings") || "{}",
        ),
      };
    } catch {
      return {
        notifications: true,
        email: false,
        profilePublic: true,
        language: "Français",
        displayMode: "Simplifié",
      };
    }
  });
  const update = (patch) =>
    setSettings((current) => ({ ...current, ...patch }));
  const save = () => {
    localStorage.setItem(
      "agrimac-enterprise-settings",
      JSON.stringify(settings),
    );
    notify("Paramètres enregistrés.");
  };
  return (
    <Frame
      title="Paramètres"
      subtitle="Configurez votre compte entreprise et vos préférences."
      action={
        <button className="enterprise-primary" onClick={save}>
          Enregistrer <Check size={14} />
        </button>
      }
    >
      <div className="enterprise-settings-grid">
        <div>
          <Panel
            title="Compte et Sécurité"
            subtitle="Protégez les accès à votre espace entreprise."
          >
            <button
              className="enterprise-setting-row"
              data-action-handled="true"
              onClick={() =>
                openAction({
                  type: "detail",
                  icon: "◉",
                  title: "Informations du compte",
                  description:
                    "Informations utilisées pour gérer votre espace entreprise.",
                  fields: [
                    { label: "Entreprise", value: "MTN Bénin SARL" },
                    { label: "Email", value: "contact@mtn-benin-agri.com" },
                    { label: "Téléphone", value: "+229 21 31 45 67" },
                    { label: "Équipe", value: "3 membres autorisés" },
                  ],
                })
              }
            >
              <ShieldIcon />
              <span>
                <b>Informations du compte</b>
                <small>Nom, email, téléphone et équipe.</small>
              </span>
              <ChevronRight size={15} />
            </button>
            <button
              className="enterprise-setting-row"
              data-action-handled="true"
              onClick={() =>
                openAction({
                  type: "form",
                  icon: "!",
                  title: "Mot de passe & Authentification",
                  description:
                    "Modifiez votre mot de passe et sécurisez vos sessions.",
                  submitLabel: "Enregistrer",
                  fields: [
                    {
                      name: "current",
                      label: "Mot de passe actuel",
                      type: "password",
                      required: true,
                    },
                    {
                      name: "next",
                      label: "Nouveau mot de passe",
                      type: "password",
                      required: true,
                    },
                    {
                      name: "confirmation",
                      label: "Confirmer le nouveau mot de passe",
                      type: "password",
                      required: true,
                    },
                  ],
                })
              }
            >
              <ShieldIcon />
              <span>
                <b>Mot de passe & Authentification</b>
                <small>
                  Modifiez votre mot de passe et gérez vos sessions.
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
          </Panel>
          <Panel
            title="Préférences & Affichage"
            subtitle="Adaptez AGRIMAC à votre utilisation."
          >
            <div className="enterprise-setting-control">
              <span>
                <b>Langue de l’application</b>
                <small>Choisissez la langue qui vous convient.</small>
              </span>
              <select
                value={settings.language}
                onChange={(event) => update({ language: event.target.value })}
              >
                <option>Français</option>
                <option>Anglais</option>
              </select>
            </div>
            <div className="enterprise-setting-control">
              <span>
                <b>Mode d’affichage</b>
                <small>Choisissez une interface adaptée à votre équipe.</small>
              </span>
              <div>
                <button
                  type="button"
                  className={`enterprise-choice ${settings.displayMode === "Simplifié" ? "active" : ""}`}
                  onClick={() => update({ displayMode: "Simplifié" })}
                >
                  Simplifié
                </button>
                <button
                  type="button"
                  className={`enterprise-choice ${settings.displayMode === "Avancé" ? "active" : ""}`}
                  onClick={() => update({ displayMode: "Avancé" })}
                >
                  Avancé
                </button>
              </div>
            </div>
          </Panel>
        </div>
        <div>
          <Panel
            title="Notifications"
            subtitle="Choisissez comment être informé."
          >
            <EnterpriseToggle
              label="Notifications Push"
              value={settings.notifications}
              onChange={() =>
                update({ notifications: !settings.notifications })
              }
            />
            <EnterpriseToggle
              label="Notifications Email"
              value={settings.email}
              onChange={() => update({ email: !settings.email })}
            />
          </Panel>
          <Panel
            title="Confidentialité"
            subtitle="Contrôlez vos données et votre visibilité."
          >
            <EnterpriseToggle
              label="Profil public visible"
              value={settings.profilePublic}
              onChange={() =>
                update({ profilePublic: !settings.profilePublic })
              }
            />
            <button
              className="enterprise-setting-row"
              data-action-handled="true"
              onClick={() =>
                openAction({
                  type: "form",
                  icon: "!",
                  title: "Gérer les autorisations",
                  description:
                    "Contrôlez les données accessibles à votre équipe.",
                  submitLabel: "Enregistrer",
                  fields: [
                    {
                      name: "members",
                      label: "Membres autorisés",
                      required: true,
                    },
                    {
                      name: "scope",
                      label: "Données partagées",
                      multiline: true,
                      required: true,
                    },
                  ],
                })
              }
            >
              <ShieldIcon />
              <span>
                <b>Gérer les autorisations</b>
                <small>Localisation, notifications et données.</small>
              </span>
              <ChevronRight size={15} />
            </button>
          </Panel>
        </div>
      </div>
    </Frame>
  );
}

export function EnterpriseReportsPage() {
  const [preview, setPreview] = useState(null);
  const [scheduled, setScheduled] = useState(false);
  const reports = [
    ["Rapport_Ventes_Mai_2025.pdf", "01 Juin 2025 à 08:30", "PDF"],
    ["Export_Inventaire_Q2.xlsx", "28 Mai 2025 à 14:15", "Excel"],
    ["Satisfaction_Client_Annuel.pdf", "15 Mai 2025 à 09:00", "PDF"],
  ];
  const generate = (name, format) =>
    downloadMock(
      name.replace(/\.[^.]+$/, ""),
      `Nom du document|${name}\nDate de génération|Aujourd’hui\nFormat|${format}`,
    );
  return (
    <Frame
      title="Rapports & Exports"
      subtitle="Générez, planifiez et analysez les performances de votre activité."
      action={
        <button
          className="enterprise-primary"
          onClick={() => generate("Rapport_Ventes_Mai_2025.pdf", "PDF")}
        >
          <Plus size={14} /> Créer un rapport
        </button>
      }
    >
      <div className="enterprise-report-templates">
        {[
          [
            "Ventes Mensuelles",
            "Excel · PDF",
            "Présentation complète des ventes et commandes",
          ],
          [
            "État de l’Inventaire",
            "Excel",
            "Stock, disponibilité et alertes de réapprovisionnement",
          ],
          [
            "Satisfaction Client",
            "PDF",
            "Notes, commentaires et évolution de la qualité",
          ],
        ].map(([title, formats, description]) => (
          <article key={title}>
            <FileText size={23} />
            <h3>{title}</h3>
            <p>{description}</p>
            <small>{formats}</small>
            <div>
              <button
                className="enterprise-secondary"
                onClick={() => setPreview({ title, description })}
              >
                Aperçu
              </button>
              <button
                className="enterprise-primary"
                onClick={() =>
                  generate(
                    title.replace(/\s+/g, "_") + ".pdf",
                    formats.includes("Excel") ? "PDF / Excel" : "PDF",
                  )
                }
              >
                Générer
              </button>
            </div>
          </article>
        ))}
      </div>
      <Panel
        title="Planification automatique"
        subtitle="Recevez vos rapports sans y penser."
      >
        <div className="enterprise-schedule">
          <label>
            Type de rapport
            <select defaultValue="Résumé des Ventes">
              <option>Résumé des Ventes (Complet)</option>
              <option>État de l’Inventaire</option>
              <option>Satisfaction Client</option>
            </select>
          </label>
          <label>
            Fréquence
            <select defaultValue="Chaque Lundi matin (Hebdomadaire)">
              <option>Chaque Lundi matin (Hebdomadaire)</option>
              <option>Chaque mois</option>
            </select>
          </label>
          <label>
            Email destinataire
            <input defaultValue="direction@mtn-benin-agri.com" />
          </label>
          <button
            className={
              scheduled ? "enterprise-secondary" : "enterprise-primary"
            }
            onClick={() => {
              setScheduled(!scheduled);
              notify(
                scheduled
                  ? "Planification désactivée."
                  : "Planification activée.",
              );
            }}
          >
            {scheduled
              ? "Désactiver la planification"
              : "Activer la planification"}
          </button>
        </div>
      </Panel>
      <Panel
        title="Historique des exports"
        subtitle="Vos rapports générés récemment."
      >
        <div className="enterprise-report-history">
          <div className="enterprise-report-history-head">
            <span>Nom du document</span>
            <span>Date de génération</span>
            <span>Format</span>
            <span>Action</span>
          </div>
          {reports.map(([name, date, format]) => (
            <div key={name}>
              <span>
                <FileText size={15} />
                {name}
              </span>
              <span>{date}</span>
              <span className="enterprise-status">{format}</span>
              <button
                className="enterprise-text-action"
                onClick={() => generate(name, format)}
              >
                Télécharger <Download size={13} />
              </button>
            </div>
          ))}
        </div>
      </Panel>
      {preview && (
        <div
          className="enterprise-modal-backdrop"
          onClick={() => setPreview(null)}
        >
          <div
            className="enterprise-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="enterprise-modal-close"
              onClick={() => setPreview(null)}
            >
              <X size={17} />
            </button>
            <span className="reference-overline">APERÇU</span>
            <h3>{preview.title}</h3>
            <p>{preview.description}</p>
            <div className="enterprise-report-preview">
              <BarChart3Icon />
              <b>Rapport AGRIMAC</b>
              <small>Indicateurs prêts à générer</small>
            </div>
            <button
              className="enterprise-primary"
              onClick={() => {
                setPreview(null);
                generate(preview.title.replace(/\s+/g, "_") + ".pdf", "PDF");
              }}
            >
              Générer le PDF
            </button>
          </div>
        </div>
      )}
    </Frame>
  );
}
function BarChart3Icon() {
  return <FileBarChart size={44} />;
}
function ShieldIcon() {
  return <ShieldCheck size={18} />;
}
function EnterpriseToggle({ label, value, onChange }) {
  return (
    <button className="enterprise-toggle" onClick={onChange}>
      <b>{label}</b>
      <i className={value ? "on" : ""}>{value ? "Activé" : "Désactivé"}</i>
    </button>
  );
}
