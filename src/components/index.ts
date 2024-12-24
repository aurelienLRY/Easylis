/{} UI Components {}/

// Buttons
export {DeleteButton , DetailButton,EditButton,IconButton , PrimaryButton, RefreshButton, SecondaryButton } from "@/components/buttons/Buttons";
export {HeaderBtn} from "@/components/buttons/NaviationAvatar.button";
export {ThemeToggle} from "@/components/buttons/ThemeToggle.button";

// Cards
export {ActivityCard} from "@/components/cards/Activity.Card";
export {CustomerCard} from "@/components/cards/Customer.Card";
export {CustomerFiche} from "@/components/cards/CustomerFiche.card";
export {SessionDetailCard} from "@/components/cards/DetailSession.Card";
export {ItemCard, ItemCardHeader,ItemCardInner,ItemContainer} from "@/components/cards/Items.Card";
export {SessionCard} from "@/components/cards/Session.Card";
export {SpotCard} from "@/components/cards/Spot.Card";
export {CustomerTables_Session} from "@/components/cards/CustomerTables_Session.card";
// Data Display
export {ItemDisplay} from "@/components/DataDisplay/Item.display";
export {DateDisplay} from "@/components/DataDisplay/Date.display";
export {TimeDisplay} from "@/components/DataDisplay/Time.display";
export {LocationDisplay} from "@/components/DataDisplay/Location.display";
export {RemainingBookingsDisplay} from "@/components/DataDisplay/RemainingBookings.display";
export {PlanDisplay} from "@/components/DataDisplay/Plan.display";
export {EmailDisplay} from "@/components/DataDisplay/Email.display";
export {PhoneDisplay} from "@/components/DataDisplay/Phone.display";
export {BookingDateDisplay} from "@/components/DataDisplay/BookingDate.display";
export {PricesDisplay,TotalPriceDisplay} from "@/components/DataDisplay/Prices.display";
// Feedback
export {Badge,CustomerPriceBadge ,GlobalPriceBadge,StatusBadge} from "@/components/feedback/Badge.feedback";
export {InfoTooltips} from "@/components/feedback/InfoTooltips.feedback";
export {LoadingSpinner} from "@/components/feedback/LoadingSpinner.feedback";
export {ToasterAction} from "@/components/feedback/ToasterAction.feedback";

// Forms
export {ActivityForm } from "@/components/form/Activity.form";
export {CustomerSessionForm} from "@/components/form/CustomerSession.form";
export {SessionForm} from "@/components/form/Session.form";
export {SpotForm} from "@/components/form/Spot.form";
export {LoginForm  } from "@/components/form/Login.form";
export {ProfilForm} from "@/components/form/Profil.form";
export {ChangePassword} from "@/components/form/ChangePassword.form";

// Inputs
export {CheckboxInput,Input,InputPhone,SelectInput,SimpleCheckboxInput,Textarea} from "@/components/input/Inputs";

// Layout
export { Dashboard } from "@/components/layout/Dashboard.layout";
export {Header} from "@/components/layout/Header.layout";
export {Modal} from "@/components/layout/Modal.layout";
export {DashboardNav} from "@/components/layout/Navigation.layout";
export {SingOutBtn} from "@/components/layout/SingOut.layout";

/{} Module Components {}/

// Session
export {AvatarSystem,checkAvatarExists} from "@/components/modules/AvatarSystem";
export {CalendarCard} from "@/components/modules/Calendar.modules";
export {CanceledCustomerSession,CustomerCanceled} from "@/components/modules/CanceledCustomer.modules";
export {CustomerBookingTable} from "@/components/modules/CustomerBookingTable.modules";
export {AllSessionsCard} from "@/components/modules/DisplaySessions.modules";
export {EmailTemplateEditor} from "@/components/modules/MailerEditor.modules";
