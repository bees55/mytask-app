export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
}

export interface CategoryTheme {
  [key: string]: string;
}

export type ActiveTab = 'dashboard' | 'kelola';
