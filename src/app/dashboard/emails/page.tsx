"use client";

import { useState, useEffect } from "react";
import { GET_EMAIL_LOGS, GET_EMAIL_STATS } from "@/libs/ServerAction/emailLog.actions";
import { ItemCard, ItemCardInner, ItemContainer, Modal } from "@/components";
import { useModal } from "@/hooks";
import { cn } from "@/utils/cn";
import {
    FiMail,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiSearch,
    FiFilter,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
    FiBarChart2
} from "react-icons/fi";

interface EmailLog {
    _id: string;
    recipient: string;
    subject: string;
    content: string;
    status: 'sent' | 'failed' | 'pending';
    messageId?: string;
    error?: string;
    sentAt: string;
    scenario: string;
    retryCount: number;
    customerId?: string;
    sessionId?: string;
    user?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        username?: string;
    };
}

interface EmailStats {
    totalSent: number;
    totalFailed: number;
    totalPending: number;
    successRate: number;
    recentActivity: Array<{ date: string; count: number }>;
}

export default function EmailsPage() {
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [stats, setStats] = useState<EmailStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 1
    });

    // Modal pour afficher le contenu de l'email
    const emailContentModal = useModal<EmailLog>();

    // Filtres
    const [filter, setFilter] = useState<string>("all");
    const [status, setStatus] = useState<string>("all");
    const [scenario, setScenario] = useState<string>("all");
    const [search, setSearch] = useState<string>("");

    const loadLogs = async () => {
        try {
            setLoading(true);

            // Convertir les filtres pour l'API
            const apiFilters = {
                status: status === "all" ? undefined : status as 'sent' | 'failed' | 'pending',
                scenario: scenario === "all" ? undefined : scenario,
                recipient: search || undefined,
                page: pagination.page,
                limit: 20
            };

            const result = await GET_EMAIL_LOGS(apiFilters);
            setLogs(result.logs);
            setPagination({
                total: result.total,
                page: result.page,
                totalPages: result.totalPages
            });
        } catch (error) {
            console.error("Erreur lors du chargement des logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await GET_EMAIL_STATS();
            setStats(result);
        } catch (error) {
            console.error("Erreur lors du chargement des stats:", error);
        }
    };

    useEffect(() => {
        loadLogs();
        loadStats();
    }, [filter, status, scenario, search]);

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FiCheckCircle className="mr-1" />Envoyé</span>;
            case 'failed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FiXCircle className="mr-1" />Échec</span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FiClock className="mr-1" />En attente</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getScenarioLabel = (scenario: string) => {
        const labels: Record<string, string> = {
            'BOOKING_REQUEST': 'Demande de réservation',
            'ADD_CUSTOMER': 'Ajout client',
            'UPDATE_CUSTOMER': 'Modification client',
            'CANCEL_CUSTOMER': 'Annulation client',
            'UPDATE_SESSION': 'Modification session',
            'CUSTOM': 'Personnalisé'
        };
        return labels[scenario] || scenario;
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Fonction pour compter les emails par statut
    const getEmailCountByStatus = (statusFilter: string) => {
        if (!logs.length) return 0;
        return logs.filter(log => log.status === statusFilter).length;
    };

    // Fonction pour compter les emails par scénario
    const getEmailCountByScenario = (scenarioFilter: string) => {
        if (!logs.length) return 0;
        return logs.filter(log => log.scenario === scenarioFilter).length;
    };

    return (
        <ItemContainer className="w-full flex flex-col items-center justify-center gap-12 min-h-[80vh]">


            {/* Statistiques */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[280px] w-full max-w-[1200px]">
                    <ItemCard className="p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-green-100">
                                <FiCheckCircle className="text-green-500 text-xl" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text">Total envoyés</p>
                                <p className="text-xl font-bold text-green-500">{stats.totalSent}</p>
                            </div>
                        </div>
                    </ItemCard>

                    <ItemCard className="p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-red-100">
                                <FiXCircle className="text-red-600 text-xl" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text">Échecs</p>
                                <p className="text-xl font-bold text-red-500">{stats.totalFailed}</p>
                            </div>
                        </div>
                    </ItemCard>

                    <ItemCard className="p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-yellow-100">
                                <FiClock className="text-yellow-600 text-xl" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text">En attente</p>
                                <p className="text-xl font-bold text-yellow-600">{stats.totalPending}</p>
                            </div>
                        </div>
                    </ItemCard>

                    <ItemCard className="p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-blue-100">
                                <FiBarChart2 className="text-blue-600 text-xl" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text">Taux de succès</p>
                                <p className="text-xl font-bold text-blue-600">{stats.successRate}%</p>
                            </div>
                        </div>
                    </ItemCard>
                </div>
            )}

            {/* Filtres */}
            <div className="min-w-[280px] w-full max-w-[1200px]">
                <ItemCard className=" py-10 lg:px-14">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiFilter /> Filtres</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3  gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Statut</label>
                            <select
                                className="w-full rounded-md border border-gray-300 bg-white py-2 px-2 md:px-6  text-base font-medium text-gray-700 outline-none transition-all duration-200"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="sent">Envoyé</option>
                                <option value="failed">Échec</option>
                                <option value="pending">En attente</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Type d&apos;email</label>
                            <select
                                className="w-full rounded-md border border-gray-300 bg-white py-2 px-2 md:px-6  text-base font-medium text-gray-700 outline-none transition-all duration-200"
                                value={scenario}
                                onChange={(e) => setScenario(e.target.value)}
                            >
                                <option value="all">Tous les types</option>
                                <option value="BOOKING_REQUEST">Demande de réservation</option>
                                <option value="ADD_CUSTOMER">Ajout client</option>
                                <option value="UPDATE_CUSTOMER">Modification client</option>
                                <option value="CANCEL_CUSTOMER">Annulation client</option>
                                <option value="UPDATE_SESSION">Modification session</option>
                                <option value="CUSTOM">Personnalisé</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Destinataire</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 bg-white py-2 px-2 md:px-6  text-base font-medium text-gray-700 outline-none transition-all duration-200"
                                placeholder="Rechercher par email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </ItemCard>
            </div>

            {/* Liste des emails */}
            <div className="min-w-[280px] w-full max-w-[1200px]">
                <ItemCardInner className="p-2 lg:p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiMail /> Emails ({pagination.total})</h2>
                    {loading ? (
                        <div className="text-center py-8">Chargement...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Aucun email trouvé
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log._id} className="border rounded-lg p-2 lg:p-4 hover:scale-105 hover:bg-slate-500 transition-all duration-300 ">
                                    <div className="flex items-center justify-around gap-5 px-1 lg:px-5">

                                        <div className="flex flex-col items-center gap-2">
                                            {getStatusBadge(log.status)}
                                            <span className="text-sm text-text">
                                                {formatDate(log.sentAt)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <h3 className="font-medium text-sm lg:text-base"><span className="text-xs lg:text-sm">A : </span>  {log.recipient}</h3>
                                            <p className="text-xs lg:text-sm">subject: {log.subject}</p>
                                            <p className="text-xs lg:text-sm text-gray-300">
                                                Type: {getScenarioLabel(log.scenario)}
                                            </p>
                                            {log.user && (
                                                <p className="text-xs lg:text-sm text-blue-300">
                                                    Envoyé par: {log.user.firstName} {log.user.lastName} ({log.user.email})
                                                </p>
                                            )}
                                            {log.error && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    Erreur: {log.error}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200" 
                                                title="Voir le contenu"
                                                onClick={() => emailContentModal.openModal(log)}
                                            >
                                                <FiEye className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-500">
                                Page {pagination.page} sur {pagination.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    title="Page précédente"
                                >
                                    <FiChevronLeft />
                                </button>
                                <button
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    title="Page suivante"
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    )}
                </ItemCardInner>
            </div>

            {/* Modal pour afficher le contenu de l'email */}
            <Modal
                isOpen={emailContentModal.isOpen}
                onClose={emailContentModal.closeModal}
                title={emailContentModal.data ? `Email - ${emailContentModal.data.subject}` : "Contenu de l&apos;email"}
            >
                {emailContentModal.data && (
                    <div className="w-full max-w-4xl">
                        <div className="mb-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold">Destinataire :</span>
                                    <p className="text-gray-300">{emailContentModal.data.recipient}</p>
                                </div>
                                <div>
                                    <span className="font-semibold">Sujet :</span>
                                    <p className="text-gray-300">{emailContentModal.data.subject}</p>
                                </div>
                                <div>
                                    <span className="font-semibold">Type :</span>
                                    <p className="text-gray-300">{getScenarioLabel(emailContentModal.data.scenario)}</p>
                                </div>
                                <div>
                                    <span className="font-semibold">Date d&apos;envoi :</span>
                                    <p className="text-gray-300">{formatDate(emailContentModal.data.sentAt)}</p>
                                </div>
                                {emailContentModal.data.user && (
                                    <div>
                                        <span className="font-semibold">Envoyé par :</span>
                                        <p className="text-gray-300">
                                            {emailContentModal.data.user.firstName} {emailContentModal.data.user.lastName} ({emailContentModal.data.user.email})
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <span className="font-semibold">Statut :</span>
                                    <div className="mt-1">{getStatusBadge(emailContentModal.data.status)}</div>
                                </div>
                                {emailContentModal.data.messageId && (
                                    <div>
                                        <span className="font-semibold">Message ID :</span>
                                        <p className="text-gray-300 text-xs break-all">{emailContentModal.data.messageId}</p>
                                    </div>
                                )}
                            </div>
                            {emailContentModal.data.error && (
                                <div className="p-4 bg-red-900 border border-red-700 rounded-md">
                                    <span className="font-semibold text-red-300">Erreur :</span>
                                    <p className="text-red-200 mt-1">{emailContentModal.data.error}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="border-t border-gray-600 pt-4">
                            <h3 className="text-lg font-semibold mb-4">Contenu de l&apos;email :</h3>
                            <div 
                                className="bg-white text-black p-6 rounded-md max-h-96 overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: emailContentModal.data.content }}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </ItemContainer>
    );
}