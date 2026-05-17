export interface NavItem {
  label: string;       // Название ("Dashboard")
  icon: string;        // Иконка ("fa-solid fa-house")
  route: string;       // Ссылка ("/dashboard")
  badge?: number;      // Доп. инфо (например, 3 для Assignment)
}
