<script>
    import { login, register, authError } from "$lib/stores/authStore.js";
    import {
        Mail,
        User,
        Lock,
        Eye,
        EyeOff,
        Loader2,
        CheckSquare,
    } from "lucide-svelte";

    let isLoginMode = true;
    let email = "";
    let username = "";
    let password = "";
    let confirmPassword = "";
    let isSubmitting = false;
    let localError = "";
    let showPassword = false;
    let showConfirmPassword = false;

    async function handleSubmit() {
        localError = "";
        authError.set(null);

        if (!email) {
            localError = "Email is required";
            return;
        }

        if (!isValidEmail(email)) {
            localError = "Please enter a valid email address";
            return;
        }

        if (!password) {
            localError = "Password is required";
            return;
        }

        if (!isLoginMode) {
            if (!username) {
                localError = "Username is required";
                return;
            }

            if (username.length < 3) {
                localError = "Username must be at least 3 characters";
                return;
            }

            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                localError =
                    "Username can only contain letters, numbers, and underscores";
                return;
            }

            if (password.length < 6) {
                localError = "Password must be at least 6 characters";
                return;
            }

            if (password !== confirmPassword) {
                localError = "Passwords do not match";
                return;
            }
        }

        isSubmitting = true;

        try {
            if (isLoginMode) {
                await login(email, password);
            } else {
                await register(email, username, password);
            }
        } catch (err) {
        } finally {
            isSubmitting = false;
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function toggleMode() {
        isLoginMode = !isLoginMode;
        localError = "";
        authError.set(null);
        password = "";
        confirmPassword = "";
    }

    function handleKeydown(event) {
        if (event.key === "Enter") {
            handleSubmit();
        }
    }

    function handlePasswordInput(event) {
        password = event.target.value;
    }

    function handleConfirmPasswordInput(event) {
        confirmPassword = event.target.value;
    }
</script>

<div class="auth-container">
    <div class="auth-card">
        <!-- Logo/Title -->
        <div class="auth-header">
            <div class="auth-logo">
                <CheckSquare size="{28}" strokeWidth="{2.5}" />
            </div>
            <h1 class="auth-title">Productivity</h1>
            <p class="auth-subtitle">
                {isLoginMode
                    ? "Sign in to your account"
                    : "Create a new account"}
            </p>
        </div>

        <!-- Form -->
        <form on:submit|preventDefault="{handleSubmit}" class="auth-form">
            <!-- Email -->
            <div class="form-group">
                <label for="email">Email</label>
                <div class="input-wrapper">
                    <Mail size="{18}" class="input-icon" />
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        bind:value="{email}"
                        disabled="{isSubmitting}"
                        on:keydown="{handleKeydown}"
                        autocomplete="email"
                    />
                </div>
            </div>

            <!-- Username (Register only) -->
            {#if !isLoginMode}
                <div class="form-group">
                    <label for="username">Username</label>
                    <div class="input-wrapper">
                        <User size="{18}" class="input-icon" />
                        <input
                            id="username"
                            type="text"
                            placeholder="johndoe"
                            bind:value="{username}"
                            disabled="{isSubmitting}"
                            on:keydown="{handleKeydown}"
                            autocomplete="username"
                        />
                    </div>
                </div>
            {/if}

            <!-- Password -->
            <div class="form-group">
                <label for="password">Password</label>
                <div class="input-wrapper">
                    <Lock size="{18}" class="input-icon" />
                    {#if showPassword}
                        <input
                            id="password"
                            type="text"
                            placeholder="••••••••"
                            value="{password}"
                            on:input="{handlePasswordInput}"
                            disabled="{isSubmitting}"
                            on:keydown="{handleKeydown}"
                            autocomplete="{isLoginMode
                                ? 'current-password'
                                : 'new-password'}"
                        />
                    {:else}
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value="{password}"
                            on:input="{handlePasswordInput}"
                            disabled="{isSubmitting}"
                            on:keydown="{handleKeydown}"
                            autocomplete="{isLoginMode
                                ? 'current-password'
                                : 'new-password'}"
                        />
                    {/if}
                    <button
                        type="button"
                        class="password-toggle"
                        on:click="{() => (showPassword = !showPassword)}"
                        tabindex="-1"
                    >
                        {#if showPassword}
                            <EyeOff size="{18}" />
                        {:else}
                            <Eye size="{18}" />
                        {/if}
                    </button>
                </div>
            </div>

            <!-- Confirm Password (Register only) -->
            {#if !isLoginMode}
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <div class="input-wrapper">
                        <Lock size="{18}" class="input-icon" />
                        {#if showConfirmPassword}
                            <input
                                id="confirmPassword"
                                type="text"
                                placeholder="••••••••"
                                value="{confirmPassword}"
                                on:input="{handleConfirmPasswordInput}"
                                disabled="{isSubmitting}"
                                on:keydown="{handleKeydown}"
                                autocomplete="new-password"
                            />
                        {:else}
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value="{confirmPassword}"
                                on:input="{handleConfirmPasswordInput}"
                                disabled="{isSubmitting}"
                                on:keydown="{handleKeydown}"
                                autocomplete="new-password"
                            />
                        {/if}
                        <button
                            type="button"
                            class="password-toggle"
                            on:click="{() =>
                                (showConfirmPassword = !showConfirmPassword)}"
                            tabindex="-1"
                        >
                            {#if showConfirmPassword}
                                <EyeOff size="{18}" />
                            {:else}
                                <Eye size="{18}" />
                            {/if}
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Error Message -->
            {#if localError || $authError}
                <div class="error-message">
                    {localError || $authError}
                </div>
            {/if}

            <!-- Submit Button -->
            <button type="submit" class="submit-btn" disabled="{isSubmitting}">
                {#if isSubmitting}
                    <Loader2 size="{18}" class="spinner" />
                    {isLoginMode ? "Signing in..." : "Creating account..."}
                {:else}
                    {isLoginMode ? "Sign In" : "Create Account"}
                {/if}
            </button>
        </form>

        <!-- Toggle Mode -->
        <div class="auth-footer">
            <span class="footer-text">
                {isLoginMode
                    ? "Don't have an account?"
                    : "Already have an account?"}
            </span>
            <button type="button" class="toggle-btn" on:click="{toggleMode}">
                {isLoginMode ? "Sign up" : "Sign in"}
            </button>
        </div>
    </div>
</div>

<style>
    .auth-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #121212;
        padding: 1rem;
    }

    .auth-card {
        width: 100%;
        max-width: 400px;
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 16px;
        padding: 2rem;
    }

    .auth-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .auth-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        background-color: rgba(187, 134, 252, 0.15);
        border-radius: 12px;
        margin-bottom: 1rem;
        color: #bb86fc;
    }

    .auth-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #e1e1e1;
        margin: 0 0 0.5rem 0;
    }

    .auth-subtitle {
        font-size: 0.875rem;
        color: #888;
        margin: 0;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #aaa;
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .input-wrapper :global(.input-icon) {
        position: absolute;
        left: 12px;
        color: #666;
        pointer-events: none;
    }

    .input-wrapper input {
        width: 100%;
        padding: 0.75rem 0.75rem 0.75rem 2.75rem;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        color: #e1e1e1;
        font-size: 0.9375rem;
        outline: none;
        transition:
            border-color 0.2s,
            background-color 0.2s;
    }

    .input-wrapper input::placeholder {
        color: #666;
    }

    .input-wrapper input:focus {
        border-color: #bb86fc;
        background-color: #252525;
    }

    .input-wrapper input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .password-toggle {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }

    .password-toggle:hover {
        color: #aaa;
    }

    .error-message {
        padding: 0.75rem 1rem;
        background-color: rgba(207, 102, 121, 0.1);
        border: 1px solid rgba(207, 102, 121, 0.3);
        border-radius: 8px;
        color: #cf6679;
        font-size: 0.875rem;
    }

    .submit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.875rem 1rem;
        background-color: #bb86fc;
        border: none;
        border-radius: 8px;
        color: #000;
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        transition:
            background-color 0.2s,
            opacity 0.2s;
        margin-top: 0.5rem;
    }

    .submit-btn:hover:not(:disabled) {
        background-color: #a66df0;
    }

    .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .submit-btn :global(.spinner) {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .auth-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #2d2d2d;
    }

    .footer-text {
        font-size: 0.875rem;
        color: #888;
    }

    .toggle-btn {
        background: none;
        border: none;
        color: #bb86fc;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        transition: color 0.2s;
    }

    .toggle-btn:hover {
        color: #a66df0;
    }
</style>
