package com.irem.takip.data

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.realtime
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.serializer.KotlinXSerializer
import kotlinx.serialization.json.Json

/**
 * Modern Supabase İstemcisi Singleton
 * Firebase bağımlılıkları tamamen kaldırılmış, hafif ve tek merkezli yönetim.
 */
object SupabaseProvider {

    private val jsonConfig = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        isLenient = true
    }

    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = "https://dbfozafdvmuuvmvqcswk.supabase.co",
            supabaseKey = "sb_publishable_cGo8QSP72fzw6GGAwO-o-Q_JD1x0LPc"
        ) {
            defaultSerializer = KotlinXSerializer(jsonConfig)
            install(Postgrest)
            install(Auth)
            install(Realtime)
        }
    }

    val postgrest: Postgrest get() = client.postgrest
    val auth: Auth get() = client.auth
    val realtime: Realtime get() = client.realtime
}
