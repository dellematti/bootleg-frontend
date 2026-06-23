import { Injectable } from '@angular/core';
import { HttpClient, HttpContext  } from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  catchError,
  map,
  of,
  switchMap,
  tap,
  finalize,
  shareReplay
} from 'rxjs';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { FORWARD_BROWSER_COOKIES } from '../interceptors/ssr-cookie.interceptor';


type AuthUser = any | null;
type AuthState = AuthUser | undefined;



interface AuthVm {
  initialized: boolean;
  loggedIn: boolean;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = 'http://localhost:8080/auth';

  // undefined = non inizializzato
  // null = inizializzato ma non autenticato
  // object = autenticato
  private currentUserSubject = new BehaviorSubject<AuthState>(undefined);
  currentUser$ = this.currentUserSubject.asObservable();

  // ViewModel già pronto per il template
  authVm$: Observable<AuthVm> = this.currentUser$.pipe(
    map((user) => ({
      initialized: user !== undefined,
      loggedIn: !!user,
      user: user ?? null
    }))
  );

  // tiene traccia della richiesta init in corso
  private initRequest$: Observable<AuthUser> | null = null;

  constructor(private http: HttpClient) {}


  // si potrebbe fare bootstrap getCsrfToken() all’avvio app invece di fare sempre il 
  // get csrf per login register e logout
  login(request: LoginRequest): Observable<AuthUser> {
    return this.getCsrfToken().pipe(
      switchMap(() =>
        this.http.post(`${this.baseUrl}/login`, request, {
          withCredentials: true
        })
      ),
      switchMap(() => this.initAuth(true))
    );
  }


  register(request: RegisterRequest): Observable<any> {
    return this.getCsrfToken().pipe(
      switchMap(() =>
        this.http.post(`${this.baseUrl}/register`, request, {
          withCredentials: true
        })
      )
    );
  }


  getUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/me`, {
      withCredentials: true,
      context: new HttpContext().set(FORWARD_BROWSER_COOKIES, true)
    });
  }


  /**
   * Inizializza lo stato auth.
   * - Se forceReload = false e lo stato è già noto, restituisce quello.
   * - Se c'è già una richiesta in corso, la riusa.
   * - Altrimenti chiama /auth/me una sola volta e condivide il risultato.
   */
  initAuth(forceReload: boolean = false): Observable<AuthUser> {
    const current = this.currentUserSubject.value;

    if (!forceReload && current !== undefined) {
      return of(current);
    }

    if (!forceReload && this.initRequest$) {
      return this.initRequest$;
    }

    this.initRequest$ = this.getUser().pipe(
      tap((user) => {
        //console.log('[AuthService] /auth/me SUCCESS', user);
        this.currentUserSubject.next(user);
      }),
      map((user) => user as AuthUser),
      catchError((err) => {
        //console.log('[AuthService] /auth/me ERROR', err);
        this.currentUserSubject.next(null);
        return of(null);
      }),
      finalize(() => {
        this.initRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.initRequest$;
  }

  loadCurrentUser(): Observable<AuthUser> {
    return this.initAuth(true);
  }

  isLogged(): Observable<boolean> {
    return this.authVm$.pipe(
      map((vm) => vm.loggedIn)
    );
  }

  getCurrentUserSnapshot(): AuthUser {
    const value = this.currentUserSubject.value;
    return value === undefined ? null : value;
  }

  getUsername(): string | null {
    const user = this.currentUserSubject.value;
    if (!user || user === undefined) {
      return null;
    }
    return user.username ?? null;
  }

  
  getCsrfToken(): Observable<any> {
    return this.http.get(`${this.baseUrl}/csrf`, {
      withCredentials: true
    });
  }


  logout(): Observable<any> {
    return this.getCsrfToken().pipe(
      switchMap(() =>
        this.http.post(`${this.baseUrl}/logout`, {}, {
          withCredentials: true
        })
      ),
      tap(() => {
        this.currentUserSubject.next(null);
      })
    );
  }


}