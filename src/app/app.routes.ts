// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/gobang/gobang.routes').then(
        (m) => m.gobangRoutes,
      ),
  },
];