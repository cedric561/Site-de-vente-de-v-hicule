@php
    $utilisateur = \Filament\Facades\Filament::auth()->user();
    $initiales = collect(explode(' ', trim($utilisateur->name)))
        ->map(fn ($mot) => mb_substr($mot, 0, 1))
        ->take(2)
        ->implode('');
@endphp

<div class="wa-sidebar-footer">
    <div class="wa-user">
        <div class="wa-avatar" title="{{ $utilisateur->name }}">{{ mb_strtoupper($initiales) }}</div>
        <div class="wa-user-infos">
            <div class="wa-user-name">{{ $utilisateur->name }}</div>
            <div class="wa-user-mail">{{ $utilisateur->email }}</div>
        </div>
    </div>

    <form method="POST" action="{{ \Filament\Facades\Filament::getLogoutUrl() }}">
        @csrf
        <button type="submit" class="wa-logout" title="Déconnexion" aria-label="Déconnexion">
            <x-heroicon-o-arrow-left-on-rectangle class="wa-ico" />
            <span>Déconnexion</span>
        </button>
    </form>
</div>
