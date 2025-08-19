import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, LifeBuoy, MessageSquare, Mail, Github } from "lucide-react";
import Link from "next/link";

const supportChannels = [
    {
        title: "Community Forums",
        description: "Ask questions, share ideas, and connect with other users.",
        icon: MessageSquare,
        cta: "Go to Forums",
        href: "#"
    },
    {
        title: "GitHub Issues",
        description: "Report bugs, request features, and track development progress.",
        icon: Github,
        cta: "Open an Issue",
        href: "#"
    },
    {
        title: "Email Support",
        description: "Get direct help from our team for account or billing issues.",
        icon: Mail,
        cta: "Contact Support",
        href: "mailto:support@example.com"
    }
]

export default function CommunityPage() {
  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Community & Support</h1>
            <p className="text-muted-foreground">Get help, share feedback, and collaborate with other Insight Canvas users.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {supportChannels.map(channel => {
                const Icon = channel.icon;
                return (
                    <Card key={channel.title} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Icon className="w-8 h-8 text-primary" />
                                <CardTitle>{channel.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{channel.description}</CardDescription>
                        </CardContent>
                        <CardContent>
                            <Link href={channel.href} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full">{channel.cta}</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    </div>
  );
}
