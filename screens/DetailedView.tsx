// screens/DetailedView.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { collection, query, where, orderBy, limit, Timestamp, getDocs } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { db } from '../config/firebaseConfig';

interface ReportDoc {
    id: string;
    crowdLevel: number;
    userName: string;
    timestamp: Timestamp;
    additionalInfo?: string;
    photoUrl?: string;
}

const crowdColors: Record<number, string> = {
    0: '#37D67A', // green
    1: '#FFDD57', // yellow
    2: '#FF605C', // red
};

// Dummy prediction data
const predictions = [
    { label: 'prev', level: 0 },
    { label: 'Now', level: 1 },
    { label: '2:30', level: 2 },
    { label: '3:00', level: 1 },
    { label: '3:30', level: 0 },
    { label: '4:00', level: 0 },
];

export default function DetailedView() {
    const { locationId, locationName } = useRoute().params as any;

    const [reports, setReports] = useState<ReportDoc[]|null>(null);
    const [latestLevel, setLatestLevel] = useState<number>(0);

    useEffect(() => {
        (async () => {
            // fetch last 2 hours
            const twoHoursAgo = Timestamp.fromDate(new Date(Date.now() - 2*60*60*1000));
            const q = query(
                collection(db, 'reports'),
                where('locationReported.id','==',locationId),
                where('timestamp','>', twoHoursAgo),
                orderBy('timestamp','desc'),
                limit(20)
            );
            const snap = await getDocs(q);
            const docs: ReportDoc[] = snap.docs.map(d => {
                const data = d.data() as any;
                return {
                    id: d.id,
                    crowdLevel: Number(data.crowdLevel),
                    userName: data.userName || 'Anonymous',
                    timestamp: data.timestamp,
                    additionalInfo: data.additionalInfo,
                    photoUrl: data.photoUrl,
                };
            });
            setReports(docs);
            if (docs.length) setLatestLevel(docs[0].crowdLevel);
        })();
    }, [locationId]);

    if (!reports) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#FF9B62" />
            </View>
        );
    }

    const minutesSince = (ts: Timestamp) =>
        Math.floor((Date.now() - ts.toDate().getTime()) / 60000);

    const levelText = (lvl: number) => {
        if (lvl === 0) return 'Not busy';
        if (lvl === 1) return 'Somewhat busy';
        return 'Very busy';
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{locationName}</Text>
                <Text style={styles.subtitle}>{levelText(latestLevel)}</Text>
            </View>

            {/* Prediction Row */}
            <View style={styles.predictBox}>
                <Text style={styles.predictLabel}>predicted activity levels</Text>
                <View style={styles.predictRow}>
                    {predictions.map((p,i) => (
                        <View key={i} style={styles.predictItem}>
                            <Ionicons
                                name="ellipse"
                                size={20}
                                color={crowdColors[p.level]}
                            />
                            <Text style={styles.predictTime}>{p.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Recent Reports */}
            <Text style={styles.section}>Recent Reports</Text>
            <FlatList
                data={reports}
                keyExtractor={r => r.id}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => {
                    const mins = minutesSince(item.timestamp);
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardUser}>
                                    {item.userName}, {mins}m ago
                                </Text>
                                <Ionicons
                                    name="ellipse"
                                    size={14}
                                    color={crowdColors[item.crowdLevel]}
                                />
                            </View>
                            {item.additionalInfo ? (
                                <Text style={styles.cardText}>
                                    “{item.additionalInfo}”
                                </Text>
                            ) : null}
                            {item.photoUrl ? (
                                <Image source={{uri:item.photoUrl}} style={styles.cardImage}/>
                            ) : null}
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loader: { flex:1,justifyContent:'center',alignItems:'center' },
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: { marginBottom: 20 },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
    },
    subtitle: {
        fontSize: 16,
        color: '#CCC',
        marginTop: 4,
    },

    predictBox: {
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    predictLabel: {
        color: '#888',
        marginBottom: 8,
    },
    predictRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    predictItem: { alignItems: 'center' },
    predictTime: {
        marginTop: 4,
        color: '#AAA',
        fontSize: 12,
    },

    section: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 8,
    },

    card: {
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    cardUser: {
        color: '#FFF',
        fontWeight: '600',
    },
    cardText: {
        color: '#DDD',
        fontStyle: 'italic',
        marginTop: 4,
    },
    cardImage: {
        marginTop: 8,
        width: '100%',
        height: 180,
        borderRadius: 10,
    },
});
