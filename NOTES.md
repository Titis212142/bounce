# Notes d'implémentation

## Points importants

### TikTok OAuth
- La configuration OAuth dans `apps/api/src/routes/auth.ts` utilise `@fastify/oauth2`
- Les endpoints TikTok peuvent varier selon la région/version de l'API
- Vérifier la documentation officielle TikTok pour les endpoints exacts

### Rendu vidéo
- Le rendu utilise Remotion pour générer les MP4
- En production, considérer utiliser l'API programmatique de Remotion plutôt que le CLI
- Le chemin `apps/engine/src/remotion/Video.tsx` doit être correctement configuré avec Remotion

### Base de données
- Les jobs sont créés dans la DB ET dans BullMQ
- Les tokens TikTok sont chiffrés avec AES-256-GCM
- Les migrations Prisma doivent être exécutées avant le premier démarrage

### Queue & Workers
- Le worker doit être démarré séparément: `pnpm worker`
- Les jobs sont retry automatiquement avec backoff exponentiel
- Le scheduler CRON vérifie les posts programmés toutes les minutes

### Storage
- En dev: fichiers locaux dans `./outputs/`
- En prod: configurer S3/MinIO avec les variables d'environnement

## Prochaines étapes

1. **Tester l'OAuth TikTok**: Configurer l'app sur TikTok for Developers
2. **Intégrer Remotion**: Vérifier que le rendu fonctionne correctement
3. **Tests**: Ajouter plus de tests unitaires et d'intégration
4. **Error handling**: Améliorer la gestion d'erreurs dans les jobs
5. **Refresh tokens**: Implémenter le refresh automatique des tokens TikTok
6. **Rate limiting**: Ajouter rate limiting pour respecter les limites TikTok
7. **Monitoring**: Ajouter logging structuré et monitoring

## Limitations connues

- Le rendu vidéo utilise un placeholder en cas d'échec Remotion
- Le refresh token TikTok n'est pas encore implémenté
- Pas de validation avancée des vidéos avant upload
- Pas de preview vidéo dans l'UI (à implémenter)
