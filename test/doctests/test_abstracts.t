#! /usr/bin/perl -w
use strict;
use warnings;
use Test::More 'no_plan';
binmode STDOUT, ":utf8";
use utf8;
use lib '../..';
use Cwd 'abs_path';
use Converter;
use Doctidy 'doctidy';
use Extractor;
my %cfg = do 'config.pl';

my %tests = (

 '/home/wo/programming/opp-tools/test/doctests/11-Byrne-Hayek-Hume.pdf' => "David Lewis claims that a simple sort of anti-Humeanism—that the rational agent desires something to the extent he believes it to be good—can be given a decision-theoretic formulation, which Lewis calls “Desire as Belief” (DAB). Given the (widely held) assumption that Jeffrey conditionalising is a rationally permissible way to change one’s mind in the face of new evidence, Lewis proves that DAB leads to absurdity. Thus, according to Lewis, the simple form of anti-Humeanism stands refuted. In this paper we investigate whether Lewis’s case against DAB can be strengthened by examining how it fares under rival versions of decision theory, including other conceptions of rational ways to change one’s mind. We prove a stronger version of Lewis’s result in “Desire as Belief II”. We then argue that the anti-Humean may escape Lewis’s argument either by adopting a version of causal decision theory, or by claiming that the refutation only applies to hyper-idealised rational agents, or by denying that the decision-theoretic framework has the expressive capacity to formulate anti-Humean-ism.",

 '/home/wo/programming/opp-tools/test/doctests/11-Incurvati-Smith-Rejection.pdf' => "Timothy Smiley’s wonderful paper ‘Rejection’ (1996) is still perhaps not as well known or well understood as it should be. This note first gives a quick presentation of themes from that paper, though done in our own way, and then considers a putative line of objection – recently advanced by Julien Murzi and Ole Hjortland (2009) – to one of Smiley’s key claims. Along the way, we consider the prospects for an intuitionistic approach to some of the issues discussed in Smiley’s paper.",

 '/home/wo/programming/opp-tools/test/doctests/11-Rayo-Generality.pdf' => "Years ago, when I was young and reckless, I believed that there was such a thing as an all-inclusive domain.1 Now I have come to see the error of my ways. The source of my mistake was a view that might be labeled ‘Tractarianism’. Tractarians believe that language is subject to a metaphysical constraint. In order for an atomic sentence to be true, there needs to be a certain kind of correspondence between the semantic structure of the sentence and the ‘metaphysical structure of reality’.",

 '/home/wo/programming/opp-tools/test/doctests/11-Skyrms-Game.pdf' => "Game theory based on rational choice is compared with game theory based on evolutionary, or other adaptive, dynamics. The Nash equilibrium concept has a central role to play in both theories, even though one makes extremely strong assumptions about cognitive capacities and common knowledge of the players, and the other does not. Nevertheless, there are also important differences between the two theories. These differences are illustrated in a number of games that model types of interaction that are key ingredients for any theory of the social contract.",

 '/home/wo/programming/opp-tools/test/doctests/22-Anon-Ramsey.pdf' => "According to the Ramsey Test, a person should accept a conditional to the extent that she would accept the consequent on the supposition that the antecedent is true. There are two apparently attractive ways of interpreting the Ramsey test: one probabilistic, and the other in terms of truth conditions and possible worlds. Unfortunately, these two interpretations are difficult to combine due to a set of triviality results. The difficulty remains even when the probabilistic interpretation is adjusted to allow for “local” as well as a “global” readings of certain conditionals. I suggest that both readings of the Ramsey Test can be usefully combined using two philosophical tools. The first of these tools is the assignment of intermediate truth values to counterfactuals. The second is the concept of a general imaging function proposed by G&auml;rdenfors [1982].",

 '/home/wo/programming/opp-tools/test/doctests/21-Polger-Shapiro-Understanding.pdf' => "Carl Gillett has defended what he calls the “dimensioned” view of the realization relation, which he contrasts with the traditional “flat” view of realization (2003, 2007; see also Gillett 2002). Intuitively, the dimensioned approach characterizes realization in terms of composition whereas the  flat approach views realization in terms of occupiers of functional roles.  Elsewhere we have argued that the general view of realization and multiple realization that Gillett advances is not able to discharge the theoretical duties of those relations (Shapiro 2004, unpublished manuscript; Polger 2004, 2007, forthcoming). Here we focus on an internal objection to Gillett’s account and then raise some broader reasons to reject it.",

 '/home/wo/programming/opp-tools/test/doctests/22-Evans-Pronouns.pdf' => "Some philosophers, notably Professors Quine and Geach, have stressed the analogies they see between pronouns of the vernacular and the bound variables of quantification theory, Geach, indeed, once maintained that 'for a philosophical theory of reference, then, it is all one whether we consider bound variables or pronouns of the vernacular'.\" This slightly overstates Ceach's positition since he recognizes that some pronouns of ordinary language do function differently from bound variables; he calls such pronouns 'pronouns of laziness'. Ceach's characterisation of pronouns of laziness has varied from time to time, but the general idea should be clear from a paradigm example: (1) A man who sometimes beats his wife has more sense than one who always gives in to her.",

 '/home/wo/programming/opp-tools/test/doctests/22-Fricker-Understanding.pdf' => "When a human speaker-hearer of a language hears and understands an utterance by another speaker of a sentence of their shared language, she typically comes to know, or comes to be in a position to know, what speech act was effected in the utterance. But her forming of a knowledgeable belief about what was said is not the most immediate psychological upshot of her auditing of the utterance. In fact she may not, as it were, bother to form a belief about what was said at all. The most immediate personal-level psychological effect of her auditing of the utterance is that she enjoys a representation of a distinctive kind special to language understanding: a conscious representation of the content and force of the utterance. She hears the utterance not merely as sound, but as the speech act that it is.",

 '/home/wo/programming/opp-tools/test/doctests/22-Kolodny-Myth.pdf' => "It is often said that there is a special class of norms, ‘rational requirements’, that demand that our attitudes be related one another in certain ways, whatever else may be the case.1  In recent work, a special class of these rational requirements has attracted particular attention: what I will call ‘requirements of formal coherence as such’, which require just that our attitudes be formally coherent.2  For example, we are rationally required, if we believe something, to believe what it entails.  And we are rationally required, if we intend an end, to intend what we take to be necessary means to it.  The intuitive idea is that formally incoherent attitudes give rise to a certain normative tension, or exert a kind of rational pressure on each another, and this tension, or pressure, is relieved just when one of the attitudes is revised.",




);

sub proc {
    my $file = shift;
    convert2xml($file);
    doctidy("$file.xml");
    my $extractor = Extractor->new("$file.xml");
    $extractor->extract('abstract');
    system("rm $file.xml");
    return $extractor->{abstract};
}

while (my ($file, $res) = each(%tests)) {
    is(proc($file), $res);
}
