import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  LoaderCircle,
  MapPin,
  Plus,
  Star,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RealAgrimacMap } from "./RealAgrimacMap";
import { notify } from "./ui";
import { resources } from "./api/resources";

export function MaintainerDashboardReal() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("Ce mois-ci");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const loadStats = async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      setStats(await resources.maintainer.statistics());
    } catch (error) {
      setStatsError(error.message);
    } finally {
      setStatsLoading(false);
    }
  };
  useEffect(() => {
    loadStats();
  }, []);
  const loadActivity = async () => {
    setActivityLoading(true);
    setActivityError("");
    try {
      const [requestData, notificationData, interventionData] = await Promise.all([
        resources.maintainer.requests(),
        resources.notifications.list({ limit: 5, skip: 0 }),
        resources.maintainer.interventions(),
      ]);
      setRequests(Array.isArray(requestData) ? requestData : requestData?.items || []);
      setNotifications(Array.isArray(notificationData) ? notificationData : notificationData?.items || []);
      setInterventions(Array.isArray(interventionData) ? interventionData : interventionData?.items || []);
    } catch (error) {
      setActivityError(error instanceof Error ? error.message : "Impossible de charger l’activité.");
    } finally {
      setActivityLoading(false);
    }
  };
  useEffect(() => { loadActivity(); }, []);
  const statValue = (value) =>
    statsLoading ? (
      <LoaderCircle className="spin" size={15} />
    ) : statsError || value === null || value === undefined ? (
      "—"
    ) : (
      value
    );
  const go = (path) => navigate(`/dashboard/maintenancier/${path}`);
  return (
    <main className="dashboard-page maintainer-dashboard maintainer-dashboard-real">
      <div className="page-heading maintainer-page-heading">
        <div>
          <span className="overline">TABLEAU DE BORD · MAINTENANCIER</span>
          <h2>Vos interventions en un coup d’œil</h2>
          <p>Voici un aperçu de vos interventions et demandes.</p>
        </div>
        <div className="maintainer-heading-actions">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            disabled
            title="Le backend ne fournit pas encore de statistiques par période."
          >
            <option>Ce mois-ci</option>
            <option>Cette semaine</option>
            <option>Cette année</option>
          </select>
          <button className="primary-action" onClick={() => go("devis")}>
            <Plus size={15} /> Nouveau devis
          </button>
        </div>
      </div>
      {statsError && (
        <div className="maintainer-stats-error" role="status">
          Impossible de charger les statistiques. <button onClick={loadStats}>Réessayer</button>
        </div>
      )}
      {activityError && <div className="maintainer-stats-error" role="status">Impossible de charger l’activité. <button onClick={loadActivity}>Réessayer</button></div>}
      <div className="maintainer-kpi-grid">
        <Kpi
          icon={<ClipboardList />}
          value={statValue(stats?.requests)}
          label="Demandes assignées"
          detail="Données du backend"
          onClick={() => go("demandes")}
        />
        <Kpi
          icon={<FileText />}
          value={statValue(stats?.quotes)}
          label="Devis envoyés"
          detail="Données du backend"
          onClick={() => go("devis")}
          tone="amber"
        />
        <Kpi
          icon={<CalendarDays />}
          value={statValue(stats?.interventions)}
          label="Interventions planifiées"
          detail="Données du backend"
          onClick={() => go("interventions")}
          tone="blue"
        />
        <Kpi
          icon={<Check />}
          value={statValue(stats?.completed)}
          label="Interventions terminées"
          detail="Historique confirmé"
          onClick={() => go("historique")}
          tone="green"
        />
        <Kpi
          icon={<Star />}
          value={statsLoading ? <LoaderCircle className="spin" size={15} /> : statsError ? "—" : `${Number(stats?.satisfaction || 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} / 5`}
          label="Note moyenne"
          detail={statsLoading || statsError ? "Données indisponibles" : `${stats.reviewCount ?? 0} avis reçus`}
          onClick={() => go("avis")}
          tone="purple"
        />
      </div>
      <div className="maintainer-middle-grid">
        <section className="maintainer-map-panel">
          <div className="maintainer-panel-head">
            <div>
              <h3>
                <MapPin size={17} /> Demandes proches de votre zone
              </h3>
              <p>Carte interactive · coordonnées réelles uniquement</p>
            </div>
            <button className="secondary-action" onClick={() => go("demandes")}>
              Voir sur la carte <ArrowRight size={13} />
            </button>
          </div>
          <div className="maintainer-map-live">
            <RealAgrimacMap className="maintainer-dashboard-real-map" markers={requests.filter(request => Number.isFinite(Number(request.latitude)) && Number.isFinite(Number(request.longitude))).map(request => ({ id: request.id, position: [Number(request.latitude), Number(request.longitude)], title: request.title, detail: request.city || request.region }))} emptyMessage="Les demandes sans coordonnées GPS ne sont pas positionnées." />
          </div>
          <div className="maintainer-map-legend">
            <span>
              <i className="near" />
              Très proche (0-5 km)
            </span>
            <span>
              <i className="close" />
              Proche (5-15 km)
            </span>
            <span>
              <i className="far" />
              Moyen (15+ km)
            </span>
          </div>
        </section>
        <section className="maintainer-side-panel">
          <header>
            <div>
              <h3>
                <Wrench size={16} /> Demandes en attente
              </h3>
              <p>{activityLoading ? "Chargement…" : `${requests.length} demande(s) retournée(s) par l’API.`}</p>
            </div>
            <button onClick={() => go("demandes")}>
              Voir tout <ArrowRight size={13} />
            </button>
          </header>
          <div className="maintainer-request-list">{requests.length ? requests.slice(0, 4).map(request => <button key={request.id} onClick={() => go("demandes")}><span className="feature-avatar">{String(request.title || "D").slice(0, 1)}</span><span><b>{request.title || "Demande sans titre"}</b><small>{request.city || request.region || "Localisation non renseignée"}</small><em>{request.status || "Statut indisponible"}</em></span><strong className="priority-pill">Détail</strong></button>) : <div className="maintainer-dashboard-empty">{activityLoading ? "Chargement des demandes…" : "Aucune demande disponible dans vos zones."}</div>}</div>
        </section>
        <section className="maintainer-side-panel notifications-panel">
          <header>
            <div>
              <h3>
                <Bell size={16} /> Notifications récentes
              </h3>
              <p>{activityLoading ? "Chargement…" : `${notifications.length} notification(s) récente(s).`}</p>
            </div>
            <button onClick={() => go("notifications")}>
              Voir tout <ArrowRight size={13} />
            </button>
          </header>
          <div className="maintainer-notifications-list">{notifications.length ? notifications.slice(0, 4).map(notification => <button key={notification.id} onClick={() => go("notifications")}><span className="notification-symbol emerald"><Bell size={15} /></span><span><b>{notification.title || "Notification"}</b><small>{notification.body || "Contenu indisponible"}</small></span><ChevronRight size={13} /></button>) : <div className="maintainer-dashboard-empty">{activityLoading ? "Chargement des notifications…" : "Aucune notification récente."}</div>}</div>
        </section>
      </div>
      <div className="maintainer-bottom-grid">
        <section className="maintainer-bottom-card">
          <header>
            <div>
              <h3>
                <CalendarDays size={16} /> Mon agenda
              </h3>
              <p>Interventions planifiées cette semaine.</p>
            </div>
            <button onClick={() => go("calendrier")}>
              Voir tout <ArrowRight size={13} />
            </button>
          </header>
          {interventions.length ? interventions.slice(0, 3).map(intervention => <button className="agenda-row-real" key={intervention.id} onClick={() => go("calendrier")}><span><b>{intervention.scheduledAt ? new Date(intervention.scheduledAt).toLocaleDateString("fr-FR") : "Date indisponible"}</b><small>{intervention.location || "Lieu non renseigné"}</small></span><strong>{intervention.title || "Intervention sans titre"}</strong><time>{intervention.scheduledAt ? new Date(intervention.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}</time><span className="status-badge">{intervention.status || "Statut indisponible"}</span></button>) : <div className="maintainer-dashboard-empty">{activityLoading ? "Chargement de l’agenda…" : "Aucune intervention planifiée."}</div>}
        </section>
        <section className="maintainer-bottom-card performance-card">
          <header>
            <div>
              <h3>
                <Activity size={16} /> Mes performances
              </h3>
              <p>Votre activité ce mois-ci.</p>
            </div>
            <button onClick={() => go("statistiques")}>
              Voir les statistiques <ArrowRight size={13} />
            </button>
          </header>
          <div className="performance-content">
            <div className="performance-ring">
              <strong>—</strong>
              <small>Taux non fourni par l’API</small>
            </div>
            <div className="performance-stats">
              <b>
                <i className="green-dot" /> Interventions terminées{" "}
                 <strong>{statsError || statsLoading ? "—" : stats?.completed ?? 0}</strong>
              </b>
              <b>
                <i className="blue-dot" /> Interventions en cours{" "}
                 <strong>{statsError || statsLoading ? "—" : Math.max(0, (stats?.interventions || 0) - (stats?.completed || 0))}</strong>
              </b>
              <b>
                <i className="amber-dot" /> Devis envoyés <strong>{statsError || statsLoading ? "—" : stats?.quotes ?? 0}</strong>
              </b>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Kpi({ icon, value, label, detail, onClick, tone = "emerald" }) {
  return (
    <button className="maintainer-kpi" onClick={onClick}>
      <span className={`maintainer-kpi-icon ${tone}`}>{icon}</span>
      <div>
        <strong>{value}</strong>
        <b>{label}</b>
        <small>{detail}</small>
      </div>
      <span className="kpi-link">
        Voir <ArrowRight size={11} />
      </span>
    </button>
  );
}
function MessageIcon({ size }) {
  return <MessageCircleFallback size={size} />;
}
function MessageCircleFallback({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8 8 0 0 1-3.2-.66L4 20l1.66-4.8A7.5 7.5 0 1 1 20 11.5Z" />
    </svg>
  );
}
