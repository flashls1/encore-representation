import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
    Sparkles, ChevronDown, ChevronRight, ExternalLink, Package, RotateCcw, Copy, Check, Save,
} from 'lucide-react';
import {
    UI_EFFECTS_REGISTRY,
    getEffectsByCategory,
    getActiveCategories,
    getDefaultProps,
    type EffectEntry,
    type PropConfig,
} from '@/ui-library/react-bits/effects/_registry';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

// ─── Category display config ────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
    backgrounds: { label: 'Backgrounds', icon: '🌌', color: '#8b5cf6' },
    animations: { label: 'Animations', icon: '✨', color: '#f59e0b' },
    'text-animations': { label: 'Text Animations', icon: '🔤', color: '#3b82f6' },
    components: { label: 'Components', icon: '🧩', color: '#10b981' },
};

// ─── Single Effect Card ─────────────────────────────────────────────────────

interface EffectCardProps {
    effect: EffectEntry;
}

const EffectCard = ({ effect }: EffectCardProps) => {
    const queryClient = useQueryClient();
    const [expanded, setExpanded] = useState(false);
    const [props, setProps] = useState<Record<string, any>>(() => getDefaultProps(effect.id));
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load saved overrides from Supabase on mount
    useEffect(() => {
        (async () => {
            try {
                const { data } = await supabase
                    .from('ui_effect_overrides')
                    .select('props')
                    .eq('effect_id', effect.id)
                    .maybeSingle();
                if (data?.props && typeof data.props === 'object' && !Array.isArray(data.props)) {
                    const defaults = getDefaultProps(effect.id);
                    setProps({ ...defaults, ...(data.props as Record<string, any>) });
                }
            } catch { /* use defaults */ }
        })();
    }, [effect.id]);

    const updateProp = useCallback((key: string, value: any) => {
        setProps(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetAll = useCallback(() => {
        setProps(getDefaultProps(effect.id));
    }, [effect.id]);

    const saveProps = useCallback(async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('ui_effect_overrides')
                .upsert(
                    { effect_id: effect.id, props: props as any, updated_at: new Date().toISOString() },
                    { onConflict: 'effect_id' }
                );
            if (error) throw error;
            // Invalidate the react-query cache so frontend picks up changes
            queryClient.invalidateQueries({ queryKey: ['ui-effect-overrides'] });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save UI effect config:', err);
        } finally {
            setSaving(false);
        }
    }, [effect.id, props, queryClient]);

    const copyProps = useCallback(() => {
        const code = `<${effect.name.replace(/\s/g, '')}\n${Object.entries(props)
            .map(([k, v]) => {
                if (typeof v === 'string') return `  ${k}="${v}"`;
                if (typeof v === 'boolean') return v ? `  ${k}` : `  ${k}={false}`;
                return `  ${k}={${v}}`;
            })
            .join('\n')}\n/>`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [props, effect.name]);

    return (
        <Card className="bg-card/50 border-primary/20 transition-all duration-200">
            {/* Header — always visible */}
            <CardHeader
                className="cursor-pointer select-none"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {expanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                            <CardTitle className="text-base">{effect.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{effect.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {effect.dependencies.map(dep => (
                            <span
                                key={dep}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono"
                                style={{
                                    backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                                    color: 'var(--accent)',
                                    border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                                }}
                            >
                                <Package className="h-2.5 w-2.5" />
                                {dep}
                            </span>
                        ))}
                        <a
                            href={effect.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>
            </CardHeader>

            {/* Expandable props panel */}
            {expanded && (
                <CardContent className="pt-0 space-y-4">
                    <Separator />

                    {/* Action bar */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            Props Configuration
                        </span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={resetAll}>
                                <RotateCcw className="h-3 w-3 mr-1" /> Reset
                            </Button>
                            <Button variant="outline" size="sm" onClick={copyProps}>
                                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                {copied ? 'Copied!' : 'Copy JSX'}
                            </Button>
                            <Button
                                size="sm"
                                onClick={saveProps}
                                disabled={saving}
                                style={{ backgroundColor: saved ? '#16a34a' : 'var(--accent)', color: '#000' }}
                            >
                                {saved ? <Check className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                            </Button>
                        </div>
                    </div>

                    {/* Controls grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(effect.propConfig).map(([key, cfg]) => (
                            <PropControl
                                key={key}
                                propKey={key}
                                config={cfg}
                                value={props[key]}
                                onChange={v => updateProp(key, v)}
                            />
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

// ─── Prop Control Renderer ──────────────────────────────────────────────────

interface PropControlProps {
    propKey: string;
    config: PropConfig;
    value: any;
    onChange: (value: any) => void;
}

const PropControl = ({ propKey, config, value, onChange }: PropControlProps) => {
    switch (config.control) {
        case 'slider':
            return (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">{config.label}</Label>
                        <span className="text-xs font-mono text-muted-foreground">{value}</span>
                    </div>
                    <Slider
                        value={[value as number]}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        onValueChange={([v]) => onChange(v)}
                    />
                    <p className="text-[10px] text-muted-foreground">{config.description}</p>
                </div>
            );

        case 'color':
            return (
                <div className="space-y-2">
                    <Label className="text-xs">{config.label}</Label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={value as string}
                            onChange={e => onChange(e.target.value)}
                            className="w-8 h-8 rounded border border-border cursor-pointer"
                        />
                        <Input
                            value={value as string}
                            onChange={e => onChange(e.target.value)}
                            className="flex-1 font-mono text-xs h-8"
                            placeholder="#ffffff"
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{config.description}</p>
                </div>
            );

        case 'select':
            return (
                <div className="space-y-2">
                    <Label className="text-xs">{config.label}</Label>
                    <Select value={value as string} onValueChange={onChange}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border">
                            {config.options?.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">{config.description}</p>
                </div>
            );

        case 'switch':
            return (
                <div className="flex items-center justify-between py-2">
                    <div>
                        <Label className="text-xs">{config.label}</Label>
                        <p className="text-[10px] text-muted-foreground">{config.description}</p>
                    </div>
                    <Switch checked={value as boolean} onCheckedChange={onChange} />
                </div>
            );

        case 'text':
            return (
                <div className="space-y-2">
                    <Label className="text-xs">{config.label}</Label>
                    <Input
                        value={value as string}
                        onChange={e => onChange(e.target.value)}
                        className="h-8 text-xs"
                        placeholder={config.defaultValue as string}
                    />
                    <p className="text-[10px] text-muted-foreground">{config.description}</p>
                </div>
            );

        default:
            return null;
    }
};

// ─── Main Admin Panel ───────────────────────────────────────────────────────

const AdminUIEffects = () => {
    const categories = getActiveCategories();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                    UI Effects Library
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Configure props for React Bits effects used across the site.
                    Expand any effect to adjust its settings.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {UI_EFFECTS_REGISTRY.length} effect{UI_EFFECTS_REGISTRY.length !== 1 ? 's' : ''} registered
                </p>
            </div>

            {/* Render by category */}
            {categories.map(cat => {
                const meta = CATEGORY_META[cat] || { label: cat, icon: '📦', color: '#888' };
                const effects = getEffectsByCategory(cat);

                return (
                    <div key={cat} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{meta.icon}</span>
                            <h3
                                className="text-lg font-semibold tracking-wide"
                                style={{ color: meta.color }}
                            >
                                {meta.label}
                            </h3>
                            <span className="text-xs text-muted-foreground ml-1">
                                ({effects.length})
                            </span>
                        </div>

                        <div className="space-y-3">
                            {effects.map(effect => (
                                <EffectCard key={effect.id} effect={effect} />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Empty state */}
            {UI_EFFECTS_REGISTRY.length === 0 && (
                <Card className="bg-card/30 border-dashed border-muted">
                    <CardContent className="py-12 text-center">
                        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">
                            No UI effects registered yet. Add effects to the registry to see them here.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminUIEffects;
